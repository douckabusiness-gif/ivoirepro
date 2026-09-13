'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { UserRole, TeamMember, ROLE_DEFINITIONS } from '@/lib/types';
import { validateAdminPassword } from '@/lib/passwordSecurity';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Shield, 
  Briefcase, 
  Package, 
  Headphones, 
  Bike, 
  Check, 
  X, 
  Trash2, 
  Edit2, 
  Key, 
  Eye, 
  RotateCcw, 
  AlertCircle, 
  Search, 
  Sparkles,
  Lock,
  Mail,
  User,
  CheckCircle2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export const AdminTeamManager: React.FC = () => {
  const { 
    currentUser, 
    teamMembers, 
    fetchTeamMembers, 
    createTeamMember, 
    updateTeamMemberRole, 
    deleteTeamMember,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendeur' as UserRole
  });
  const [editRole, setEditRole] = useState<UserRole>('vendeur');
  const [editPassword, setEditPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load team members on mount
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Role icon helper
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'vendeur':
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case 'gestionnaire_stock':
        return <Package className="w-4 h-4 text-blue-400" />;
      case 'support':
        return <Headphones className="w-4 h-4 text-amber-400" />;
      case 'gestionnaire_livraison':
        return <Bike className="w-4 h-4 text-rose-400" />;
      default:
        return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleBadgeClasses = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'vendeur':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'gestionnaire_stock':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'support':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'gestionnaire_livraison':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle Add Member
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError('Tous les champs sont obligatoires.');
      return;
    }

    const passwordValidation = validateAdminPassword(formData.password);
    if (!passwordValidation.valid) {
      setFormError(passwordValidation.errors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTeamMember({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      if (!res.success) {
        setFormError(res.error || 'Erreur lors de la création du compte.');
      } else {
        setFormSuccess(`Le collaborateur ${formData.name} a été ajouté avec le rôle ${ROLE_DEFINITIONS[formData.role]?.shortLabel || formData.role} !`);
        setFormData({ name: '', email: '', password: '', role: 'vendeur' });
        setTimeout(() => {
          setIsAddModalOpen(false);
          setFormSuccess('');
        }, 1800);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Erreur réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Member Role
  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await updateTeamMemberRole(selectedMember.id, editRole);
      if (!res.success) {
        setFormError(res.error || 'Erreur lors de la mise à jour.');
      } else {
        setIsEditModalOpen(false);
        setSelectedMember(null);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Erreur réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Member
  const handleDelete = async (member: TeamMember) => {
    if (confirm(`Êtes-vous sûr de vouloir révoquer l'accès de "${member.name}" (${member.email}) ?`)) {
      const res = await deleteTeamMember(member.id);
      if (!res.success) {
        alert(res.error || 'Impossible de supprimer ce collaborateur.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Équipe & Attribution des Rôles</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase">
              {teamMembers.length} Collaborateur{teamMembers.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Créez des accès adaptés pour vos vendeurs, magasiniers, livreurs et support client en masquant vos finances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTeamMembers()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
            title="Rafraîchir l'équipe"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setFormError('');
              setFormSuccess('');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau Collaborateur</span>
          </button>
        </div>
      </div>

      {/* Role Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((rKey) => {
          const rInfo = ROLE_DEFINITIONS[rKey];
          const membersWithRole = teamMembers.filter((m) => m.role === rKey);

          return (
            <div 
              key={rKey} 
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${getRoleBadgeClasses(rKey)}`}>
                  {getRoleIcon(rKey)}
                </div>
                <span className="text-xs font-black text-white bg-slate-800 px-2 py-0.5 rounded-md">
                  {membersWithRole.length}
                </span>
              </div>
              <div>
                <p className="text-xs font-extrabold text-white truncate">{rInfo.shortLabel}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">{rInfo.description}</p>
              </div>
              <div className="pt-1 text-[10px] font-bold text-slate-500">
                {rInfo.allowedTabs.length} modules autorisés
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Team Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h3 className="text-base font-black text-white">Membres de l'Équipe ({filteredMembers.length})</h3>
            <p className="text-xs text-slate-400">Liste des comptes autorisés à se connecter à la console d'administration.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher nom, email..."
                className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">Tous les Rôles</option>
              <option value="admin">👑 Super Admin</option>
              <option value="vendeur">💼 Vendeur</option>
              <option value="gestionnaire_stock">📦 Gestionnaire Stock</option>
              <option value="support">🎧 Support Client</option>
              <option value="gestionnaire_livraison">🛵 Responsable Livraison</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Collaborateur</th>
                <th className="pb-3">Rôle Assigné</th>
                <th className="pb-3">Modules Autorisés</th>
                <th className="pb-3">Date d'ajout</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    Aucun collaborateur trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const isCurrent = currentUser?.email === member.email || currentUser?.id === member.id;
                  const rDef = ROLE_DEFINITIONS[member.role] || ROLE_DEFINITIONS.vendeur;

                  return (
                    <tr key={member.id} className="hover:bg-slate-800/50 transition">
                      
                      {/* Name & Email */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-black text-sm text-slate-200 border border-slate-700">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{member.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-black uppercase">
                                  Vous
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block">{member.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold flex items-center gap-1.5 ${getRoleBadgeClasses(member.role)}`}>
                            {getRoleIcon(member.role)}
                            <span>{rDef.badge}</span>
                          </span>
                        </div>
                      </td>

                      {/* Allowed Modules summary */}
                      <td className="py-3.5">
                        <span className="text-slate-300 text-[11px] font-semibold">
                          {member.role === 'admin' && '🌟 Accès Illimité (16 modules)'}
                          {member.role === 'vendeur' && '📦 Commandes, Produits, Chat, Rayons'}
                          {member.role === 'gestionnaire_stock' && '📊 Stocks, Produits, Rayons'}
                          {member.role === 'support' && '💬 Live Chat, Consultation Commandes'}
                          {member.role === 'gestionnaire_livraison' && '🛵 Commandes, Dispatch Coursiers'}
                        </span>
                      </td>

                      {/* Created date */}
                      <td className="py-3.5 text-slate-400 text-[11px]">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('fr-FR') : 'Actif'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setEditRole(member.role);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Modifier le rôle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => handleDelete(member)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                              title="Révoquer l'accès"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: AJOUTER UN COLLABORATEUR */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Nouveau Collaborateur</h2>
                  <p className="text-xs text-slate-400">Créez un compte et assignez un rôle précis.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateMember} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nom complet de l'employé</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mamadou Cissé"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email de connexion</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ex: cisse@boutique.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mot de passe initial</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Au moins 6 caractères"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Rôle Assigné</span>
                  <span className="text-[10px] text-slate-500 font-normal">Définit les accès autorisés</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['vendeur', 'gestionnaire_stock', 'support', 'gestionnaire_livraison', 'admin'] as UserRole[]).map((r) => {
                    const rInfo = ROLE_DEFINITIONS[r];
                    const isSelected = formData.role === r;

                    return (
                      <div
                        key={r}
                        onClick={() => setFormData({ ...formData, role: r })}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left space-y-1 ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/50'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                            {getRoleIcon(r)}
                            <span>{rInfo.shortLabel}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                          {rInfo.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Création en cours...' : 'Créer le Compte'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MODIFIER LE RÔLE D'UN MEMBRE */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-black text-white">Modifier le Rôle</h2>
                <p className="text-xs text-slate-400">{selectedMember.name} ({selectedMember.email})</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Choisir le nouveau rôle</label>
                
                <div className="space-y-2">
                  {(['vendeur', 'gestionnaire_stock', 'support', 'gestionnaire_livraison', 'admin'] as UserRole[]).map((r) => {
                    const rInfo = ROLE_DEFINITIONS[r];
                    const isSelected = editRole === r;

                    return (
                      <div
                        key={r}
                        onClick={() => setEditRole(r)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/50'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg border ${getRoleBadgeClasses(r)}`}>
                            {getRoleIcon(r)}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-white">{rInfo.label}</p>
                            <p className="text-[10px] text-slate-400">{rInfo.description}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
