var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ora from 'ora';
export function wrapLoading(message, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        // 开启loading
        const spinner = ora(message);
        spinner.start();
        try {
            const res = yield fn();
            return res;
        }
        catch (error) {
            console.log('执行出错', error.message);
        }
        finally {
            // 关闭loading
            spinner.succeed();
        }
    });
}
