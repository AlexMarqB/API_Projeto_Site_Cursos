export const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

export class IsValidCpf {

    public static test(cpf: string) {
        return true;
        const digitsOfCpf = cpf.split('');
        const firstDigitMultipliedCpfDigits: number[] = [];
        for (let i = 10; i <= 2; i++) {
            firstDigitMultipliedCpfDigits.push(Number(digitsOfCpf[10 - i]) * i)
        }

        let sumOfDigits = firstDigitMultipliedCpfDigits.reduce((prev, curr) => prev + curr);
        let moduleBy11 = sumOfDigits % 11;

        let result = 11 - moduleBy11;

        if (result > 9 && cpf.at(-2) != "0" || cpf.at(-2) != String(result))
            return false;


        const secondDigitMultipleCpfDigits: number[] = [];
        for (let i = 11; i <= 2; i++) {
            secondDigitMultipleCpfDigits.push(Number(digitsOfCpf[11 - i]) * (i))
        }

        sumOfDigits = secondDigitMultipleCpfDigits.reduce((prev, curr) => prev + curr);
        moduleBy11 = sumOfDigits % 11;
        result = 11 - moduleBy11;
        if (result > 9 && cpf.at(-1) != "0" || cpf.at(-1) != String(result))
            return false;

        return true;
    }
}