import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.reserva.deleteMany();
  await prisma.hospede.deleteMany();
  await prisma.quarto.deleteMany();

  // Criar quartos
  const quartos = await Promise.all([
    prisma.quarto.create({
      data: {
        numero: 101,
        tipo: 'Standard',
        precoDiaria: 150.00,
        disponivel: true
      }
    }),
    prisma.quarto.create({
      data: {
        numero: 102,
        tipo: 'Standard',
        precoDiaria: 150.00,
        disponivel: true
      }
    }),
    prisma.quarto.create({
      data: {
        numero: 201,
        tipo: 'Suite Executiva',
        precoDiaria: 250.00,
        disponivel: true
      }
    }),
    prisma.quarto.create({
      data: {
        numero: 202,
        tipo: 'Suite Executiva',
        precoDiaria: 250.00,
        disponivel: true
      }
    }),
    prisma.quarto.create({
      data: {
        numero: 301,
        tipo: 'Suite Luxo',
        precoDiaria: 400.00,
        disponivel: true
      }
    }),
    prisma.quarto.create({
      data: {
        numero: 302,
        tipo: 'Suite Luxo',
        precoDiaria: 400.00,
        disponivel: true
      }
    }),
    prisma.quarto.create({
      data: {
        numero: 401,
        tipo: 'Cobertura Premium',
        precoDiaria: 800.00,
        disponivel: true
      }
    })
  ]);

  console.log(`✅ ${quartos.length} quartos criados com sucesso!`);

  // Criar hóspedes de exemplo
  const hospedes = await Promise.all([
    prisma.hospede.create({
      data: {
        nome: 'João',
        sobrenome: 'Silva',
        cpf: '12345678901',
        email: 'joao.silva@email.com'
      }
    }),
    prisma.hospede.create({
      data: {
        nome: 'Maria',
        sobrenome: 'Santos',
        cpf: '98765432100',
        email: 'maria.santos@email.com'
      }
    }),
    prisma.hospede.create({
      data: {
        nome: 'Pedro',
        sobrenome: 'Oliveira',
        cpf: '11122233344',
        email: 'pedro.oliveira@email.com'
      }
    })
  ]);

  console.log(`✅ ${hospedes.length} hóspedes criados com sucesso!`);

  // Criar uma reserva de exemplo
  const reserva = await prisma.reserva.create({
    data: {
      hospedeId: hospedes[0].id,
      quartoId: quartos[0].id,
      dataCheckIn: new Date('2024-02-15'),
      dataCheckOut: new Date('2024-02-18'),
      valorTotal: 450.00,
      status: 'ativa'
    }
  });

  // Marcar quarto como ocupado
  await prisma.quarto.update({
    where: { id: quartos[0].id },
    data: { disponivel: false }
  });

  console.log(`✅ 1 reserva criada com sucesso!`);
  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('📊 Dados criados:');
  console.log(`  - ${quartos.length} quartos`);
  console.log(`  - ${hospedes.length} hóspedes`);
  console.log(`  - 1 reserva`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
