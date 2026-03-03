import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const TOUR_CONFIG = {
  Home_TenantManagement: [
    {
      selector: '[data-tour="btn-add-tenant"]',
      title: '➕ Добавить арендатора',
      description: 'Нажмите, чтобы добавить нового арендатора. Заполните его имя, адрес, телефон и данные об аренде.'
    },
    {
      selector: '[data-tour="btn-import"]',
      title: '📥 Импорт CSV/Excel',
      description: 'Массовая загрузка арендаторов из файла CSV или Excel.'
    },
    {
      selector: '[data-tour="btn-export"]',
      title: '📤 Экспорт в PDF',
      description: 'Создание профессионального PDF-отчета со всеми арендаторами и их балансами.'
    },
    {
      selector: '[data-tour="tenant-table"]',
      title: '📋 Таблица арендаторов',
      description: 'Просмотр всех арендаторов. Используйте кнопки действий для управления каждым из них.'
    },
    {
      selector: '[data-tour="btn-profile"]',
      title: '👤 Просмотр профиля',
      description: 'Нажмите для просмотра подробной информации, истории платежей и заметок.'
    },
    {
      selector: '[data-tour="btn-select"]',
      title: '✅ Выбрать арендатора',
      description: 'Быстрый выбор арендатора для создания новой квитанции.'
    },
    {
      selector: '[data-tour="btn-edit"]',
      title: '✏️ Редактировать',
      description: 'Изменение данных арендатора (телефон, адрес, размер аренды).'
    },
    {
      selector: '[data-tour="btn-delete"]',
      title: '🗑️ Удалить',
      description: 'Полное удаление арендатора. Действие нельзя отменить.'
    }
  ],
  Home_CreateReceipt: [
    {
      selector: '[data-tour="tenant-selector"]',
      title: '👥 Выбор арендатора',
      description: 'Выберите арендатора, для которого создается квитанция.'
    },
    {
      selector: '[data-tour="manual-mode"]',
      title: '✍️ Ручной режим',
      description: 'Вводите все данные о платежах вручную по неделям.'
    },
    {
      selector: '[data-tour="automatic-mode"]',
      title: '🤖 Автоматический режим',
      description: 'Загрузите банковскую выписку (PDF), и система сама распознает платежи.'
    },
    {
      selector: '[data-tour="period-dates"]',
      title: '📅 Даты периода',
      description: 'Установите даты начала и конца квитанции.'
    },
    {
      selector: '[data-tour="starting-debt"]',
      title: '💰 Начальный долг/кредит',
      description: 'Введите предыдущий баланс (красный = долг, зеленый = переплата).'
    },
    {
      selector: '[data-tour="add-transaction"]',
      title: '➕ Добавить транзакцию',
      description: 'Добавляйте записи об оплате за каждую неделю.'
    },
    {
      selector: '[data-tour="balance-preview"]',
      title: '📊 Предварительный баланс',
      description: 'Автоматический подсчет итогового баланса.'
    },
    {
      selector: '[data-tour="receipt-notes"]',
      title: '📝 Заметки',
      description: 'Добавьте комментарии, которые будут напечатаны на квитанции.'
    }
  ],
  Home_AutomaticMode: [
    {
      selector: '[data-tour="auto-upload"]',
      title: '📄 Загрузка выписки',
      description: 'Загрузите PDF банковской выписки. Система найдет платежи.'
    },
    {
      selector: '[data-tour="auto-payments"]',
      title: '✅ Найденные платежи',
      description: 'Список распознанных платежей. Система постарается автоматически привязать их к арендаторам.'
    },
    {
      selector: '[data-tour="auto-apply"]',
      title: '🚀 Применить платежи',
      description: 'Выберите арендатора и нажмите Apply, чтобы перенести платежи в новую квитанцию.'
    }
  ],
  Home_ReceiptHistory: [
    {
      selector: '[data-tour="tenant-filter"]',
      title: '🔍 Фильтр',
      description: 'Фильтрация квитанций по конкретному арендатору.'
    },
    {
      selector: '[data-tour="receipt-row"]',
      title: '📄 Квитанция',
      description: 'Каждая строка — это сохраненная квитанция.'
    },
    {
      selector: '[data-tour="btn-view-print"]',
      title: '🖨️ Просмотр и Печать',
      description: 'Откройте квитанцию для печати или сохранения в PDF.'
    },
    {
      selector: '[data-tour="btn-delete-receipt"]',
      title: '🗑️ Удаление',
      description: 'Удаление квитанции. Потребуется указать причину (минимум 6 символов).'
    }
  ],
  Home_Tools: [
    {
      selector: '[data-tour="tools-grid"]',
      title: '🛠️ Инструменты',
      description: 'Дополнительные утилиты для анализа и управления данными.'
    },
    {
      selector: '[data-tour="tool-card-labels"]',
      title: '🏷️ Address Labels',
      description: 'Печать наклеек с адресами.'
    },
    {
      selector: '[data-tour="tool-card-rent-report"]',
      title: '📊 Rent Report',
      description: 'PDF-отчет о статусе оплат всех арендаторов.'
    },
    {
      selector: '[data-tour="tool-card-arrears-overview"]',
      title: '📈 Arrears Overview',
      description: 'Графики и аналитика задолженностей.'
    },
    {
      selector: '[data-tour="tool-card-arrears-alert"]',
      title: '🔔 Arrears Alert',
      description: 'Список арендаторов с большими долгами.'
    },
    {
      selector: '[data-tour="tool-card-bulk-letters"]',
      title: '✉️ Bulk Letters',
      description: 'Генерация писем о задолженности.'
    },
    {
      selector: '[data-tour="tool-card-payment-lookup"]',
      title: '🔍 Payment Lookup',
      description: 'Поиск платежей по сумме или дате.'
    },
    {
      selector: '[data-tour="tool-card-statement-calendar"]',
      title: '📅 Statement Calendar',
      description: 'Календарь закрытых месяцев для каждого арендатора.'
    },
    {
      selector: '[data-tour="tool-card-export-excel"]',
      title: '📥 Export to Excel',
      description: 'Экспорт всех данных в Excel/CSV.'
    }
  ]
};

export default function InteractiveTour({ isOpen, onClose, currentPage, currentTab, currentMode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [elementRect, setElementRect] = useState(null);

  // Determine which tour to show
  let tourKey = currentPage;
  if (currentPage === 'Home') {
    if (currentTab === 'tenants') tourKey = 'Home_TenantManagement';
    else if (currentTab === 'receipt') {
      tourKey = currentMode === 'automatic' ? 'Home_AutomaticMode' : 'Home_CreateReceipt';
    }
    else if (currentTab === 'history') tourKey = 'Home_ReceiptHistory';
    else if (currentTab === 'tools') tourKey = 'Home_Tools';
  }

  const tourSteps = TOUR_CONFIG[tourKey] || [];
  const currentTourStep = tourSteps[currentStep];

  // Update highlighted element and its position
  useEffect(() => {
    if (!isOpen || !currentTourStep || currentPage === 'Settings') return;

    const getVisibleElement = (selector) => {
      const elements = Array.from(document.querySelectorAll(selector));
      return elements.find(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
    };

    const updateRect = () => {
      if (highlightedElement) {
        setElementRect(highlightedElement.getBoundingClientRect());
      }
    };

    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    const findElement = () => {
      let element = getVisibleElement(currentTourStep.selector);
      
      // Smart detection for CreateReceipt (Steps 4+ need a tenant selected)
      if (!element && tourKey === 'Home_CreateReceipt' && currentStep >= 3) {
        const firstTenantBtn = getVisibleElement('[data-tour="tenant-selector"] button');
        if (firstTenantBtn) {
          firstTenantBtn.click(); // Auto-select to demonstrate
          setTimeout(() => {
            const newElement = getVisibleElement(currentTourStep.selector);
            if (newElement) {
              setHighlightedElement(newElement);
              setElementRect(newElement.getBoundingClientRect());
              newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              setHighlightedElement(null);
              setElementRect(null);
            }
          }, 200);
          return;
        }
      }

      if (element) {
        setHighlightedElement(element);
        const rect = element.getBoundingClientRect();
        setElementRect(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setHighlightedElement(null);
        setElementRect(null);
      }
    };

    findElement();
    const timer = setTimeout(findElement, 250); // wait a bit longer for layouts to settle
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [currentStep, isOpen, currentTourStep, currentPage, currentTab, tourKey, highlightedElement]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  // Don't show if not open, on Settings page, or no tour steps
  if (!isOpen || currentPage === 'Settings' || tourSteps.length === 0 || !currentTourStep) return null;

  // Calculate tooltip position
  const isElementMissing = !elementRect;
  
  let tooltipTop = window.innerHeight / 2 - 100;
  if (!isElementMissing) {
    const spaceBelow = window.innerHeight - elementRect.bottom;
    const spaceAbove = elementRect.top;
    
    // Prefer placing below, but if not enough space and more space above, place above
    if (spaceBelow < 250 && spaceAbove > 250) {
      tooltipTop = elementRect.top - 200; // approximate height + padding
    } else {
      tooltipTop = elementRect.bottom + 20;
    }
    
    // Final clamp to keep it on screen
    tooltipTop = Math.max(20, Math.min(tooltipTop, window.innerHeight - 250));
  }

  return (
    <>
      {/* Global Overlay (Only if spotlight is missing to avoid double darkening) */}
      {isElementMissing && (
        <div className="fixed inset-0 bg-black/50 z-[9990] pointer-events-none" />
      )}

      {/* Spotlight - highlight the element (provides its own darkness via box-shadow) */}
      {!isElementMissing && (
        <div
          className="fixed z-[9990] pointer-events-none"
          style={{
            left: `${elementRect.left - 4}px`,
            top: `${elementRect.top - 4}px`,
            width: `${elementRect.width + 8}px`,
            height: `${elementRect.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            borderRadius: '8px',
            border: '2px solid #3B82F6',
            animation: 'tourPulse 2s ease-in-out infinite'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[9999] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 sm:p-6 w-[90%] max-w-sm border border-gray-100/50 backdrop-blur-xl"
        style={{
          left: '50%',
          top: `${tooltipTop}px`,
          transform: 'translateX(-50%)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="flex items-start justify-between mb-4 relative">
          <h3 className="font-bold text-gray-900 text-lg sm:text-xl leading-tight pr-8">{currentTourStep.title}</h3>
          <button
            onClick={handleClose}
            className="absolute top-0 right-0 p-1.5 hover:bg-gray-100/80 rounded-full transition-colors bg-gray-50/50 text-gray-400 hover:text-gray-900"
            aria-label="Close tour"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">{currentTourStep.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100 hover:bg-gray-100 text-gray-700"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            Back
          </button>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              STEP
            </span>
            <span className="text-sm font-bold text-gray-900 bg-gray-100/80 px-2.5 py-0.5 rounded-full">
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === tourSteps.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
          >
            Next
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        @keyframes tourPulse {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 2px #3B82F6; }
          50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 4px #3B82F6; }
        }
      `}</style>
    </>
  );
}