export class CPF {
  private readonly valor: string;

  private constructor(cpf: string) {
    this.valor = cpf;
  }

  static criar(cpf: string): CPF {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (!this.validar(cpfLimpo)) {
      throw new Error('CPF inválido');
    }
    
    return new CPF(cpfLimpo);
  }

  private static validar(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }

  formatar(): string {
    return this.valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  valorSemFormatacao(): string {
    return this.valor;
  }

  equals(other: CPF): boolean {
    return this.valor === other.valor;
  }

  toString(): string {
    return this.formatar();
  }
}
