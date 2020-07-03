import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (accumulator, t) => {
        const transacoes = { ...accumulator };
        transacoes.income += t.type === 'income' ? Number(t.value) : 0;
        transacoes.outcome += t.type === 'outcome' ? Number(t.value) : 0;
        transacoes.total = transacoes.income - transacoes.outcome;
        return transacoes;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
    return balance;
  }
}

export default TransactionsRepository;
