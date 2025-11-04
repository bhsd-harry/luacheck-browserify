import {LuaFactory} from 'wasmoon';
// @ts-expect-error wasm file
import glue from 'wasmoon/dist/glue.wasm';
import {script} from './bundle.json';
import type {LuaEngine} from 'wasmoon';

declare interface LuaReport {
	code: string;
	line: number;
	column: number;
	end_column: number;
	msg?: string;
	indirect?: boolean;
	func?: boolean;
}
declare type checkFunc = (s: string, std: string) => Record<string, never> | LuaReport[];
declare type checkFuncAsync = (s: string, std: string) => Promise<Diagnostic[]>;
export interface Diagnostic {
	line: number;
	column: number;
	end_column: number;
	code: string;
	msg: string;
	severity: 0 | 1 | 2;
}

const warnings: Record<string, string> = {
	'011': 'Syntax error',
	'021': 'Invalid inline option',
	'022': 'Unpaired inline push directive',
	'023': 'Unpaired inline pop directive',
	'033': 'Invalid use of a compound operator',
	111: 'Setting an undefined global variable',
	112: 'Mutating an undefined global variable',
	113: 'Accessing an undefined global variable',
	121: 'Setting a read-only global variable',
	122: 'Setting a read-only field of a global variable$2',
	131: 'Unused implicitly defined global variable',
	142: 'Setting an undefined field of a global variable$2',
	143: 'Accessing an undefined field of a global variable$2',
	211: 'Unused local $1',
	212: 'Unused argument',
	213: 'Unused loop variable',
	214: 'Unused variable',
	221: 'Local variable is accessed but never set',
	231: 'Local variable is set but never accessed',
	232: 'Argument is set but never accessed',
	233: 'Loop variable is set but never accessed',
	241: 'Local variable is mutated but never accessed',
	311: 'Value assigned to a local variable is unused',
	312: 'Value of an argument is unused',
	313: 'Value of a loop variable is unused',
	314: 'Value of a field in a table literal is unused',
	321: 'Accessing uninitialized local variable',
	331: 'Value assigned to a local variable is mutated but never accessed',
	341: 'Mutating uninitialized local variable',
	411: 'Redefining a local variable',
	412: 'Redefining an argument',
	413: 'Redefining a loop variable',
	421: 'Shadowing a local variable',
	422: 'Shadowing an argument',
	423: 'Shadowing a loop variable',
	431: 'Shadowing an upvalue',
	432: 'Shadowing an upvalue argument',
	433: 'Shadowing an upvalue loop variable',
	511: 'Unreachable code',
	512: 'Loop can be executed at most once',
	521: 'Unused label',
	531: 'Left-hand side of an assignment is too short',
	532: 'Left-hand side of an assignment is too long',
	541: 'Empty do-end block',
	542: 'Empty if branch',
	551: 'Empty statement',
	561: 'Cyclomatic complexity is too high',
	571: 'A numeric for loop goes from #(expr) down to 1 or less without negative step',
	581: 'Negation of a relational operator: operator can be flipped',
	582: 'Error prone negation: negation has a higher priority than equality',
	611: 'A line contains only whitespace',
	612: 'A line contains trailing whitespace',
	613: 'Trailing whitespace in a string',
	614: 'Trailing whitespace in a comment',
	621: 'Inconsistent indentation',
	631: 'Line is too long',
};

/**
 * 获取警告等级
 * @param code 错误代码
 */
const getSeverity = (code: string): 0 | 1 | 2 => {
	if (/^[01]/u.test(code)) {
		return 2;
	}
	return /^(?:6|5[4-6]|213)/u.test(code) ? 0 : 1;
};

/**
 * 添加警告信息
 * @param errors 语法警告
 */
const addMsg = (errors: LuaReport[]): Diagnostic[] => errors
	.map((error): Omit<Diagnostic, 'msg'> & {msg: string | undefined} => {
		const {code, msg, ...e} = error;
		return {
			...e,
			code,
			msg: msg ?? warnings[code]?.replace('$1', e.func ? 'function' : 'variable')
				.replace('$2', e.indirect ? ' using a local alias' : ''),
			severity: getSeverity(code),
		};
	}).filter((error): error is Diagnostic => Boolean(error.msg));

class Luacheck {
	#text: string;
	#running: Promise<Diagnostic[]> | undefined;
	#check;
	#std;

	/**
	 * @param check Luacheck
	 * @param std 全局变量集
	 */
	constructor(check: checkFuncAsync, std: string) {
		this.#check = check;
		this.#std = std;
	}

	/**
	 * 提交语法分析
	 * @param text 待分析的代码
	 * @description
	 * - 总是更新`#text`以便`#lint`完成时可以判断是否需要重新分析
	 * - 如果已有进行中的分析，则返回该分析的结果
	 * - 否则开始新的分析
	 */
	queue(text: string): Promise<Diagnostic[]> {
		this.#text = text;
		this.#running ??= this.#lint(text);
		return this.#running;
	}

	/**
	 * 执行语法分析
	 * @param text 待分析的代码
	 * @description
	 * - 完成后会检查`#text`是否已更新，如果是则重新分析
	 * - 总是返回最新的分析结果
	 */
	async #lint(text: string): Promise<Diagnostic[]> {
		const errors = await this.#check(text, this.#std);
		return new Promise(resolve => {
			setTimeout(() => {
				if (this.#text === text) {
					this.#running = undefined;
					resolve(errors);
					return;
				}
				this.#running = this.#lint(this.#text);
				resolve(this.#running);
			}, 0);
		});
	}
}

let lua: Promise<LuaEngine> | undefined;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const uri = typeof process === 'object' && typeof process.versions?.node === 'string' ? undefined : glue as string;

/**
 * 使用Luacheck进行语法检查
 * @param s 待检查的代码
 * @param std 全局变量集
 */
const checkAsync: checkFuncAsync = async (s, std) => {
	if (!lua) {
		lua = new LuaFactory(uri).createEngine({enableProxy: false});
		await (await lua).doString(script);
	}
	const errors = ((await lua).global.get('check') as checkFunc)(s, std);
	return Array.isArray(errors) ? addMsg(errors) : [];
};

/**
 * 创建一个`Luacheck`实例
 * @param std 全局变量集
 */
const luaCheck = (std: string): Luacheck => new Luacheck(checkAsync, std);
luaCheck.check = checkAsync;

// eslint-disable-next-line unicorn/prefer-global-this
Object.assign(typeof globalThis === 'object' ? globalThis : self, {luacheck: luaCheck});

declare global {
	const luacheck: typeof luaCheck;
}
