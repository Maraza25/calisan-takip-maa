'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Search, UserX, UserCheck, AlertCircle, Building2, Pencil } from 'lucide-react';
import {
  getEmployeesBySite,
  addEmployee,
  getEmployeeByTC,
  activateEmployee,
  deactivateEmployee,
  searchEmployees,
  updateEmployee,
} from '@/lib/employeeService';
import { Employee } from '@/types';
import { validateTC } from '@/lib/utils';
import Modal from '@/components/Modal';
import { useSite } from '@/contexts/SiteContext';

export default function EmployeesPage() {
  const { selectedSite, selectedSiteId } = useSite();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [tc, setTc] = useState('');
  const [fullName, setFullName] = useState('');
  const [formError, setFormError] = useState('');
  const [formWarning, setFormWarning] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [existingEmployee, setExistingEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editTc, setEditTc] = useState('');
  const [editError, setEditError] = useState('');
  const [editWarning, setEditWarning] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const loadEmployees = useCallback(async () => {
    if (!selectedSiteId) {
      setEmployees([]);
      setFilteredEmployees([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getEmployeesBySite(selectedSiteId);
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error('Çalışanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const performSearch = async () => {
      if (!selectedSiteId) return;

      if (searchTerm.trim() === '') {
        setFilteredEmployees(employees);
        return;
      }

      try {
        const results = await searchEmployees(selectedSiteId, searchTerm);
        setFilteredEmployees(results);
      } catch (error) {
        console.error('Arama sırasında hata:', error);
      }
    };

    performSearch();
  }, [searchTerm, employees, selectedSiteId]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) return;

    setFormError('');
    setFormWarning('');

    if (!tc || !fullName.trim()) {
      setFormError('Tüm alanları doldurun.');
      return;
    }

    if (!validateTC(tc)) {
      setFormWarning('Bu TC Kimlik numarası geçerli değil, ancak yine de kaydedilebilir.');
    }

    setFormLoading(true);

    try {
      const existing = await getEmployeeByTC(selectedSiteId, tc);

      if (existing) {
        if (!existing.disabled) {
          setFormError('Bu TC kimlik numarasına sahip çalışan bu şantiyede zaten aktif.');
          setFormLoading(false);
          return;
        } else {
          setExistingEmployee(existing);
          setShowReactivationModal(true);
          setFormLoading(false);
          return;
        }
      }

      await addEmployee(selectedSiteId, tc, fullName.trim());

      setTc('');
      setFullName('');
      setFormWarning('');
      setShowAddForm(false);
      await loadEmployees();
    } catch (error) {
      console.error('Çalışan eklenirken hata:', error);
      setFormError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!existingEmployee) return;

    setFormLoading(true);
    try {
      await activateEmployee(existingEmployee.id);

      setShowReactivationModal(false);
      setExistingEmployee(null);
      setTc('');
      setFullName('');
      setFormWarning('');
      setShowAddForm(false);

      await loadEmployees();
    } catch (error) {
      console.error('Çalışan aktifleştirilirken hata:', error);
      setFormError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (employeeId: string) => {
    if (!confirm('Bu çalışanı pasifleştirmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deactivateEmployee(employeeId);
      await loadEmployees();
    } catch (error) {
      console.error('Çalışan pasifleştirilirken hata:', error);
    }
  };

  const handleActivate = async (employeeId: string) => {
    try {
      await activateEmployee(employeeId);
      await loadEmployees();
    } catch (error) {
      console.error('Çalışan aktifleştirilirken hata:', error);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditFullName(employee.fullName);
    setEditTc(employee.tc);
    setEditError('');
    setEditWarning('');
  };

  const submitEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setEditError('');
    setEditWarning('');

    if (!editTc || !editFullName.trim()) {
      setEditError('Tüm alanları doldurun.');
      return;
    }

    if (!validateTC(editTc)) {
      setEditWarning('Bu TC Kimlik numarası geçerli değil, ancak yine de kaydedilebilir.');
    }

    setEditLoading(true);

    try {
      await updateEmployee(editingEmployee.id, {
        fullName: editFullName.trim(),
        tc: editTc,
      });
      await loadEmployees();
      setEditingEmployee(null);
    } catch (error) {
      console.error('Çalışan güncellenirken hata:', error);
      setEditError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setEditLoading(false);
    }
  };

  const activeEmployees = filteredEmployees.filter(e => !e.disabled);
  const inactiveEmployees = filteredEmployees.filter(e => e.disabled);

  if (!selectedSiteId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center space-y-4">
        <div className="flex justify-center">
          <Building2 className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Şantiye Seçilmedi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Çalışan listelerini görüntülemek için üst menüden bir şantiye seçin veya yeni bir şantiye oluşturun.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Çalışanlar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Toplam {employees.length} çalışan
          </p>
          {selectedSite && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
              <Building2 className="w-4 h-4" />
              Aktif Şantiye: {selectedSite.name}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Yeni Çalışan Ekle
        </button>
      </div>

      <Modal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setFormError('');
          setFormWarning('');
          setTc('');
          setFullName('');
        }}
        title="Yeni Çalışan Ekle"
        size="md"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            </div>
          )}

          {formWarning && (
            <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">{formWarning}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                TC Kimlik No
              </label>
              <input
                type="text"
                value={tc}
                onChange={(e) => {
                  setTc(e.target.value.replace(/\D/g, '').slice(0, 11));
                  setFormWarning('');
                }}
                placeholder="12345678901"
                maxLength={11}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Soyad
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ahmet Yılmaz"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formLoading ? 'Ekleniyor...' : 'Ekle'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setFormError('');
                setFormWarning('');
                setTc('');
                setFullName('');
              }}
              className="flex-1 px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="TC kimlik no veya isim ile ara..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Aktif Çalışanlar ({activeEmployees.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activeEmployees.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz aktif çalışan bulunmuyor.'}
            </div>
          ) : (
            activeEmployees.map((employee) => (
              <div
                key={employee.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {employee.fullName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    TC: {employee.tc}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeactivate(employee.id)}
                    className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Pasifleştir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {inactiveEmployees.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pasif Çalışanlar ({inactiveEmployees.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {inactiveEmployees.map((employee) => (
              <div
                key={employee.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors opacity-60"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {employee.fullName}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(pasif)</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    TC: {employee.tc}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleActivate(employee.id)}
                    className="inline-flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg font-medium transition-colors"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Aktifleştir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showReactivationModal && !!existingEmployee}
        onClose={() => {
          setShowReactivationModal(false);
          setExistingEmployee(null);
        }}
        title="Çalışan Zaten Mevcut"
        size="md"
      >
        {existingEmployee && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              <strong>{existingEmployee.fullName}</strong> adlı çalışan bu şantiyede mevcut ancak pasif durumda. Tekrar aktif etmek ister misiniz?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReactivate}
                disabled={formLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {formLoading ? 'Aktifleştiriliyor...' : 'Evet, Aktif Et'}
              </button>
              <button
                onClick={() => {
                  setShowReactivationModal(false);
                  setExistingEmployee(null);
                }}
                disabled={formLoading}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Hayır, İptal Et
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!editingEmployee}
        onClose={() => {
          if (editLoading) return;
          setEditingEmployee(null);
          setEditError('');
          setEditWarning('');
        }}
        title="Çalışanı Düzenle"
        size="md"
      >
        {editingEmployee && (
          <form onSubmit={submitEditEmployee} className="space-y-4">
            {editError && (
              <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
              </div>
            )}

            {editWarning && (
              <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-600 dark:text-yellow-400">{editWarning}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  TC Kimlik No
                </label>
                <input
                  type="text"
                  value={editTc}
                  onChange={(e) => {
                    setEditTc(e.target.value.replace(/\D/g, '').slice(0, 11));
                    setEditWarning('');
                  }}
                  placeholder="12345678901"
                  maxLength={11}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={editLoading}
                className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editLoading ? 'Güncelleniyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editLoading) return;
                  setEditingEmployee(null);
                  setEditError('');
                  setEditWarning('');
                }}
                className="flex-1 px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}


