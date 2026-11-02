import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, RefreshCw, Search, X } from 'lucide-react';
import { apiRequest, createRecord, getList, getPage, type PageResult } from '../services/api';

type Field = { key: string; label: string; type?: string; required?: boolean; options?: { value: string; label: string }[]; load?: string; paged?: boolean; optionValue?: string; optionLabel?: string };
type Action = { label: string; endpoint: (row: Record<string, unknown>) => string; body?: Record<string, unknown> | ((row: Record<string, unknown>) => Record<string, unknown>); tone?: 'primary' | 'quiet'; whenStatus?: string };
export type ResourceConfig = {
  title: string; subtitle: string; endpoint: string; paged?: boolean;
  columns: { key: string; label: string; format?: (value: unknown, row: Record<string, unknown>) => string }[];
  fields?: Field[]; actions?: Action[]; search?: boolean; createPayload?: (values: Record<string, string>) => unknown;
};

const money = (value: unknown) => `PKR ${Number(value ?? 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
const date = (value: unknown) => value ? new Date(String(value)).toLocaleDateString() : '—';

export default function ResourcePage({ config }: { config: ResourceConfig }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectOptions, setSelectOptions] = useState<Record<string, { value: string; label: string }[]>>({});

  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (config.paged) {
        const result: PageResult<Record<string, unknown>> = await getPage(config.endpoint, search);
        setRows(result.data);
      } else setRows(await getList<Record<string, unknown>>(config.endpoint));
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load records.'); }
    finally { setLoading(false); }
  }, [config.endpoint, config.paged, search]);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    let active = true;
    const loaders = (config.fields ?? []).filter((field) => field.load);
    void Promise.all(loaders.map(async (field) => {
      try {
        const result = field.paged ? await getPage<Record<string, unknown>>(field.load!) : await getList<Record<string, unknown>>(field.load!);
        const values = Array.isArray(result) ? result : result.data;
        const idKey = field.optionValue ?? (field.load!.includes('warehouses') ? 'warehouseId' : field.load!.includes('categories') ? 'categoryId' : 'supplierId');
        const labelKey = field.optionLabel ?? 'name';
        return [field.key, values.map((row) => ({ value: String(row[idKey]), label: String(row[labelKey]) }))] as const;
      } catch { return [field.key, []] as const; }
    })).then((entries) => { if (active) setSelectOptions(Object.fromEntries(entries)); });
    return () => { active = false; };
  }, [config.fields]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const form = new FormData(event.currentTarget);
    const values: Record<string, string> = {};
    const payload: Record<string, unknown> = {};
    for (const field of config.fields ?? []) {
      const value = form.get(field.key)?.toString().trim() ?? '';
      values[field.key] = value;
      payload[field.key] = field.type === 'number' ? Number(value) : value || null;
    }
    try {
      await createRecord(config.endpoint, config.createPayload ? config.createPayload(values) : payload);
      setModal(false); setNotice(`${config.title.replace(/s$/, '')} created.`); await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save this record.'); }
    finally { setSaving(false); }
  };

  const runAction = async (action: Action, row: Record<string, unknown>) => {
    setError(''); setNotice('');
    try { const body = typeof action.body === 'function' ? action.body(row) : action.body; await apiRequest(action.endpoint(row), { method: 'POST', body: JSON.stringify(body ?? {}) }); setNotice(`${action.label} completed.`); await reload(); }
    catch (e) { setError(e instanceof Error ? e.message : `Unable to ${action.label.toLowerCase()}.`); }
  };

  const filtered = useMemo(() => config.search || config.paged ? rows : rows.filter((row) =>
    config.columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(search.toLowerCase()))), [config, rows, search]);

  return <main className="module-page">
    <div className="module-heading">
      <div><div className="eyebrow">UPLYNK ERP · OPERATIONS</div><h1>{config.title}</h1><p>{config.subtitle}</p></div>
      <div className="module-tools">
        {config.search && <label className="module-search"><Search size={16}/><input aria-label={`Search ${config.title}`} placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)}/></label>}
        <button className="module-button quiet" onClick={() => void reload()} title="Refresh"><RefreshCw size={15}/><span>Refresh</span></button>
        {config.fields && <button className="module-button primary" onClick={() => { setError(''); setModal(true); }}><Plus size={16}/><span>New record</span></button>}
      </div>
    </div>
    {error && <div className="module-alert error" role="alert">{error}</div>}
    {notice && <div className="module-alert success" role="status">{notice}</div>}
    <section className="module-card">
      <div className="module-card-head"><strong>{config.title}</strong><span>{loading ? 'Loading…' : `${filtered.length} records`}</span></div>
      {loading ? <div className="module-empty">Loading records…</div> : filtered.length === 0 ? <div className="module-empty"><strong>No records yet</strong><span>Records from your selected branch will appear here.</span></div> :
        <div className="module-table-wrap"><table className="module-table"><thead><tr>{config.columns.map((column) => <th key={column.key}>{column.label}</th>)}{config.actions?.length ? <th>Actions</th> : null}</tr></thead>
          <tbody>{filtered.map((row, index) => <tr key={String(row[config.columns[0]?.key] ?? index)}>{config.columns.map((column) => {
            const raw = row[column.key]; const formatted = column.format ? column.format(raw, row) : raw == null || raw === '' ? '—' : String(raw);
            const badge = column.key.toLowerCase().includes('status');
            return <td key={column.key}>{badge ? <span className={`module-badge ${String(raw).toLowerCase()}`}>{formatted}</span> : formatted}</td>;
          })}{config.actions?.length ? <td><div className="module-row-actions">{config.actions.filter((action) => !action.whenStatus || String(row.status) === action.whenStatus).map((action) => <button className={`module-button small ${action.tone ?? 'quiet'}`} key={action.label} onClick={() => void runAction(action, row)}>{action.label}</button>)}</div></td> : null}</tr>)}</tbody>
        </table></div>}
    </section>
    {modal && <div className="module-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}><section className="module-dialog" role="dialog" aria-modal="true" aria-labelledby="module-dialog-title">
      <div className="module-dialog-head"><div><span className="eyebrow">NEW ENTRY</span><h2 id="module-dialog-title">Create {config.title.replace(/s$/, '')}</h2></div><button className="module-icon-button" aria-label="Close dialog" onClick={() => setModal(false)}><X size={18}/></button></div>
      <form onSubmit={submit}><div className="module-fields">{(config.fields ?? []).map((field) => <label className="module-field" key={field.key}><span>{field.label}{field.required ? ' *' : ''}</span>
        {field.options || field.load ? <select name={field.key} required={field.required}><option value="">Choose {field.label.toLowerCase()}</option>{(field.options ?? selectOptions[field.key] ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === 'textarea' ? <textarea name={field.key} required={field.required} rows={3}/> : <input name={field.key} type={field.type ?? 'text'} required={field.required} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? 'any' : undefined} defaultValue={field.type === 'date' ? new Date().toISOString().slice(0, 10) : undefined}/>}
      </label>)}</div>{error && <div className="module-alert error">{error}</div>}<div className="module-dialog-actions"><button type="button" className="module-button quiet" onClick={() => setModal(false)}>Cancel</button><button disabled={saving} type="submit" className="module-button primary">{saving ? 'Saving…' : 'Create record'}</button></div></form>
    </section></div>}
  </main>;
}

export { money, date };
