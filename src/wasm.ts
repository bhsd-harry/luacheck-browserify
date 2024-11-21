declare interface LuaReport {
	code: string;
	line: number;
	column: number;
	end_column: number;
	msg?: string;
	func?: boolean;
}
declare interface Diagnostic {
	line: number;
	column: number;
	end_column: number;
	msg: string;
	severity: 1 | 2;
}
declare type checkFunc = (s: string, std: string) => Record<string, never> | LuaReport[];

import {LuaFactory} from 'wasmoon';
import {version} from 'wasmoon/package.json';
import script = require('./bundle.json');

const warnings: Record<string, string> = {
	'011': 'Syntax error',
	'021': 'Invalid inline option',
	'022': 'Unpaired inline push directive',
	'023': 'Unpaired inline pop directive',
	111: 'Setting an undefined global variable',
	112: 'Mutating an undefined global variable',
	113: 'Accessing an undefined global variable',
	121: 'Setting a read-only global variable',
	122: 'Seeting a read-only field of a global variable',
	131: 'Unused implicitly defined global variable',
	142: 'Setting an undefined field of a global variable',
	143: 'Accessing an undefined field of a global variable',
	211: 'Unused local $1',
	212: 'Unused argument',
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
	571: 'A numeric for loop goes from #(expr) down to 1 or less without negative step',
	581: 'Negation of a relational operator: operator can be flipped',
	582: 'Error prone negation: negation has a higher priority than equality',
};

/**
 * 添加警告信息
 * @param allErrors 语法警告
 */
const addMsg = (allErrors: LuaReport[]): Diagnostic[] => {
	const errors: (LuaReport | Diagnostic)[] = allErrors.filter(({code}) => !/^(?:6|5[45]|213)/u.test(code));
	for (const error of errors) {
		const {code, func} = error as LuaReport;
		error.msg ??= warnings[code]!.replace('$1', func ? 'function' : 'variable');
		(error as Diagnostic).severity = /^[01]/u.test(code) ? 2 : 1;
	}
	return errors as Diagnostic[];
};

class Luacheck {
	#text: string;
	#running: Promise<Diagnostic[]> | undefined;
	#check;
	#std;

	/**
	 * @param check Luacheck
	 * @param std 全局变量集
	 */
	constructor(check: Function, std: string) {
		this.#check = check as checkFunc;
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
	async #lint(text: string): Promise<Diagnostic[]> { // eslint-disable-line require-await
		const errors = this.#check(text, this.#std);
		if (this.#text === text) {
			setTimeout(() => {
				this.#running = undefined;
			}, 0);
			return Array.isArray(errors) ? addMsg(errors) : [];
		}
		this.#running = this.#lint(this.#text);
		return this.#running;
	}
}

/**
 * 创建一个`Luacheck`实例
 * @param std 全局变量集
 */
const check = async (std: string): Promise<Luacheck> => {
	const uri = typeof global === 'object'
			? undefined
			: `https://testingcf.jsdelivr.net/npm/wasmoon@${version}/dist/glue.wasm`,
		lua = await new LuaFactory(uri).createEngine();
	await lua.doString(script);
	return new Luacheck(lua.global.get('check') as Function, std);
};

Object.assign(globalThis, {luacheck: check});

declare global {
	const luacheck: typeof check;
}
