import { Router } from 'express';
import { getRepository, getCustomRepository } from 'typeorm';

import multer from 'multer';
import uploadConfig from '../config/uploads';

import Transactions from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import AppError from '../errors/AppError';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);
interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getRepository(Transactions);
  const transactionsCustomRepository = getCustomRepository(
    TransactionsRepository,
  );
  const balance = await transactionsCustomRepository.getBalance();
  const transactions = await transactionsRepository.find();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionService = new CreateTransactionService();
  const transaction = await transactionService.execute({
    title,
    value,
    type,
    category,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const deleteService = new DeleteTransactionService();
    await deleteService.execute(id);
    response.send();
  } catch (err) {
    response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    try {
      const { filename } = request.file;
      const importTransacton = new ImportTransactionsService();
      const transactionService = new CreateTransactionService();
      const newTransactions: Transactions[] = [];
      const transactions = await importTransacton.execute(filename);
      /* eslint-disable no-await-in-loop */
      // eslint-disable-next-line no-restricted-syntax
      for (const transaction of transactions) {
        const [title, type_, value, category] = transaction;
        const data: Request = {
          title,
          type: type_ === 'income' ? 'income' : 'outcome',
          value: Number(value),
          category,
        };
        newTransactions.push(await transactionService.execute(data));
      }
      return response.json(newTransactions);
    } catch (err) {
      throw new AppError(err.message);
    }
  },
);

export default transactionsRouter;
