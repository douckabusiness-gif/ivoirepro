'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { validateAdminPassword } from '@/lib/passwordSecurity';

type AdminPasswordSecurityProps = {
  currentUser: {
    email?: string;
    isDemo?: boolean;
  } | null;
};

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

const emptyForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export const AdminPasswordSecurity: React.FC<AdminPasswordSecurityProps> = ({ currentUser }) => {
  const [form, setForm] = useState(emptyForm);
  const [visibleFields, setVisibleFields] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordChecks = useMemo(() => {
    const value = form.newPassword;
    return [
      { label: '12 caractères minimum', valid: Array.from(value).length >= 12 },
      { label: 'Une majuscule', valid: /[A-Z]/.test(value) },
      { label: 'Une minuscule', valid: /[a-z]/.test(value) },
      { label: 'Un chiffre', valid: /[0-9]/.test(value) },
      { label: 'Un caractère spécial', valid: /[^A-Za-z0-9]/.test(value) },
    ];
  }, [form.newPassword]);

  const setField = (field: PasswordField, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError('');
    setSuccess('');
  };

  const toggleVisibility = (field: PasswordField) => {
    setVisibleFields((previous) => ({ ...previous, [field]: !previous[field] }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (currentUser?.isDemo) {
      setError('Le changement de mot de passe est indisponible en mode démo.');
      return;
    }
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Renseignez les trois champs pour continuer.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('La confirmation du nouveau mot de passe ne correspond pas.');
      return;
    }

    const validation = validateAdminPassword(form.newPassword);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setError(data.error || 'Impossible de modifier le mot de passe.');
        return;
      }

      setForm(emptyForm);
      setSuccess(data.message || 'Mot de passe modifié avec succès.');
    } catch {
      setError('Erreur réseau. Réessayez dans quelques instants.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPasswordField = (
    field: PasswordField,
    label: string,
    autoComplete: string,
    placeholder: string,
  ) => {
    const visible = visibleFields[field];
    return (
      <div className="space-y-1.5">
        <label htmlFor={`admin-${field}`} className="text-xs font-bold text-slate-300">
          {label}
        </label>
        <div className="relative">
          <input
            id={`admin-${field}`}
            type={visible ? 'text' : 'password'}
            value={form[field]}
            onChange={(event) => setField(field, event.target.value)}
            autoComplete={autoComplete}
            placeholder={placeholder}
            maxLength={72}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-3.5 pr-11 text-sm text-white outline-hidden transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            disabled={isSubmitting || Boolean(currentUser?.isDemo)}
          />
          <button
            type="button"
            onClick={() => toggleVisibility(field)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            disabled={isSubmitting || Boolean(currentUser?.isDemo)}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3 border-b border-slate-800 pb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-white">Sécurité du compte</h2>
          <p className="mt-1 text-xs text-slate-400">
            Modifiez le mot de passe de votre compte administrateur. Les autres sessions seront fermées après validation.
          </p>
          {currentUser?.email && (
            <p className="mt-2 text-[11px] font-semibold text-indigo-300">Compte : {currentUser.email}</p>
          )}
        </div>
      </div>

      {currentUser?.isDemo && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Connectez-vous avec un compte réel pour modifier son mot de passe.</span>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          {renderPasswordField(
            'currentPassword',
            'Mot de passe actuel',
            'current-password',
            'Saisissez le mot de passe actuel',
          )}
          {renderPasswordField(
            'newPassword',
            'Nouveau mot de passe',
            'new-password',
            'Choisissez un mot de passe fort',
          )}
          {renderPasswordField(
            'confirmPassword',
            'Confirmer le nouveau mot de passe',
            'new-password',
            'Répétez le nouveau mot de passe',
          )}
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-200">
              <LockKeyhole className="h-4 w-4 text-indigo-400" />
              Conditions de sécurité
            </div>
            <div className="space-y-2">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-xs">
                  <span className={`h-2 w-2 rounded-full ${check.valid ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <span className={check.valid ? 'text-emerald-300' : 'text-slate-400'}>{check.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Boolean(currentUser?.isDemo)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            {isSubmitting ? 'Modification en cours...' : 'Modifier le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  );
};

