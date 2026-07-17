import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { budgetService } from '../services/budget';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PlusIcon, TrashIcon } from '../components/Icons';
import type { Transaction, TransactionInput, BudgetCategory, TransactionType } from '../types';

const EXPENSE_CATEGORIES: BudgetCategory[] = ['Alimentation', 'Transport', 'Logement', 'Loisirs', 'Santé', 'Éducation', 'Autre'];
const INCOME_CATEGORIES: BudgetCategory[] = ['Salaire', 'Autre'];

function TransactionForm({ onSubmit, onCancel }: { onSubmit: (input: TransactionInput) => Promise<void>; onCancel: () => void }) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('Alimentation');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !description.trim()) return;
    setLoading(true);
    await onSubmit({ type, amount: amt, category, description: description.trim(), date });
    setLoading(false);
  }

  return (
    <form className="goal-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Type</label>
        <div className="type-toggle">
          <button type="button" className={`type-btn ${type === 'expense' ? 'type-btn--expense' : ''}`} onClick={() => { setType('expense'); setCategory('Alimentation'); }}>
            Dépense
          </button>
          <button type="button" className={`type-btn ${type === 'income' ? 'type-btn--income' : ''}`} onClick={() => { setType('income'); setCategory('Salaire'); }}>
            Revenu
          </button>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Montant (FCFA)</label>
          <input type="number" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="1" step="1" autoFocus />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Catégorie</label>
        <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value as BudgetCategory)}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Description</label>
        <input type="text" className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Courses supermarché" maxLength={100} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn--primary" disabled={loading || !amount || !description.trim()}>
          {loading ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}

export function BudgetPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await budgetService.getAll(user.id);
    setTransactions(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const handleCreate = async (input: TransactionInput) => {
    if (!user) return;
    await budgetService.create(user.id, input);
    await load();
    setShowCreate(false);
    toast('Transaction ajoutée 💰');
  };

  const handleDelete = useCallback(async () => {
    if (!user || !deletingId) return;
    setTransactions((prev) => prev.filter((t) => t.id !== deletingId));
    await budgetService.remove(user.id, deletingId);
    setDeletingId(null);
    toast('Transaction supprimée');
  }, [user, deletingId, toast]);

  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

  return (
    <div className="service-page">
      <div className="service-page__header">
        <div>
          <h1>Budget</h1>
          <p className="service-page__subtitle">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          <PlusIcon size={18} /> Ajouter
        </button>
      </div>

      <div className="budget-stats">
        <div className="budget-stat budget-stat--balance">
          <span className="budget-stat__label">Solde</span>
          <span className={`budget-stat__value ${stats.balance >= 0 ? 'budget-stat__value--positive' : 'budget-stat__value--negative'}`}>
            {fmt(stats.balance)}
          </span>
        </div>
        <div className="budget-stat budget-stat--income">
          <span className="budget-stat__label">Revenus</span>
          <span className="budget-stat__value budget-stat__value--positive">+{fmt(stats.income)}</span>
        </div>
        <div className="budget-stat budget-stat--expense">
          <span className="budget-stat__label">Dépenses</span>
          <span className="budget-stat__value budget-stat__value--negative">-{fmt(stats.expense)}</span>
        </div>
      </div>

      {loading ? (
        <div className="service-page__loading"><div className="loading-spinner" /></div>
      ) : transactions.length === 0 ? (
        <div className="service-page__empty">
          <span className="service-page__empty-icon">💰</span>
          <h3>Aucune transaction</h3>
          <p>Commencez à suivre vos finances.</p>
          <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
            <PlusIcon size={18} /> Première transaction
          </button>
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map((t) => (
            <div key={t.id} className="transaction-item">
              <div className={`transaction-item__dot transaction-item__dot--${t.type}`} />
              <div className="transaction-item__info">
                <span className="transaction-item__desc">{t.description}</span>
                <span className="transaction-item__meta">{t.category} · {new Date(t.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <span className={`transaction-item__amount transaction-item__amount--${t.type}`}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
              </span>
              <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => setDeletingId(t.id)}>
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle transaction</h2>
            </div>
            <div className="modal-body">
              <TransactionForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Supprimer la transaction"
        message="Voulez-vous vraiment supprimer cette transaction ?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
