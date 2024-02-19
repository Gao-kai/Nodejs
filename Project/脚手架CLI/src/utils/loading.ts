import ora from 'ora';


export async function wrapLoading(message,fn){

    // 开启loading
    const spinner = ora(message);
    spinner.start();

    try {
        const res = await fn();
        return res;
    } catch (error) {
        console.log('执行出错',error.message);
    } finally{
        // 关闭loading
        spinner.succeed();
    }
}

