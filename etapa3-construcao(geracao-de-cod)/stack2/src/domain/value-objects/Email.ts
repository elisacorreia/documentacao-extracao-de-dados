export class Email {
  private readonly valor: string;

  private constructor(email: string) {
    this.valor = email.toLowerCase().trim();
  }

  static criar(email: string): Email {
    if (!this.validar(email)) {
      throw new Error('E-mail inválido');
    }
    
    return new Email(email);
  }

  private static validar(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  getValor(): string {
    return this.valor;
  }

  equals(other: Email): boolean {
    return this.valor === other.valor;
  }

  toString(): string {
    return this.valor;
  }
}
