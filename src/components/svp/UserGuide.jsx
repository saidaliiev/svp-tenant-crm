import React from 'react';

export default function UserGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">👋 Добро пожаловать в St. Vincent de Paul CRM</h1>
        <p className="text-xl text-gray-600 font-light">
          Ваш надёжный помощник в управлении арендаторами и квитанциями 📊
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-blue-50 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">📋 Оглавление</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div><strong>Введение</strong> — что такое эта система и как её использовать</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div><strong>Основная навигация</strong> — как переходить между разделами</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div><strong>Управление арендаторами</strong> — добавление, редактирование, профили</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">4️⃣</span>
            <div><strong>Создание квитанций</strong> — пошаговое руководство</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">5️⃣</span>
            <div><strong>История квитанций</strong> — просмотр и управление</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">6️⃣</span>
            <div><strong>Профиль арендатора</strong> — полная информация и история</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">7️⃣</span>
            <div><strong>Полезные советы</strong> — лучшие практики и ответы на вопросы</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">8️⃣</span>
            <div><strong>Инструменты</strong> — отчеты, экспорт, наклейки и аналитика</div>
          </div>
        </div>
      </div>

      {/* Section 1: Introduction */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">🎯 Что такое St. Vincent de Paul CRM?</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
          <p className="text-lg text-gray-700 mb-4">
            <strong>St. Vincent de Paul CRM</strong> — это <em>современная система управления жильцами</em>, созданная специально для организаций, которые управляют жилищным фондом. 
          </p>
          <p className="text-lg text-gray-700">
            С её помощью вы сможете:
          </p>
          <ul className="list-none space-y-3 mt-4 ml-4">
            <li className="text-gray-700"><strong>✅ Быстро находить информацию</strong> об арендаторах — их имена, адреса, статус платежей</li>
            <li className="text-gray-700"><strong>✅ Создавать красивые квитанции</strong> об оплате за аренду в несколько кликов</li>
            <li className="text-gray-700"><strong>✅ Отслеживать платежи</strong> — сколько получено, сколько задолжено</li>
            <li className="text-gray-700"><strong>✅ Видеть полную историю</strong> каждого жильца и всех платежей</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
          <p className="text-gray-700">
            💡 <strong>Полезный совет:</strong> Система полностью приспособлена для работы на телефоне, планшете и компьютере. Вы можете работать где угодно!
          </p>
        </div>
      </section>

      {/* Section 2: Navigation */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">🧭 Основная навигация</h2>
        
        <p className="text-gray-700 mb-8">
          В верхней части приложения вы найдёте <strong>четыре основные вкладки</strong>. Кликните на нужную, чтобы перейти в раздел:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition">
            <h3 className="text-xl font-bold text-blue-600 mb-3">👥 Tenants</h3>
            <p className="text-gray-700 mb-3">Управление всеми арендаторами</p>
            <p className="text-sm text-gray-600">Добавляйте новых жильцов, редактируйте их данные, смотрите баланс задолженности</p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-400 hover:bg-green-50 transition">
            <h3 className="text-xl font-bold text-green-600 mb-3">📄 Create Receipt</h3>
            <p className="text-gray-700 mb-3">Создание новых квитанций</p>
            <p className="text-sm text-gray-600">Выбирайте арендатора и быстро создавайте красивую квитанцию об оплате</p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-400 hover:bg-orange-50 transition">
            <h3 className="text-xl font-bold text-orange-600 mb-3">📚 Receipt History</h3>
            <p className="text-gray-700 mb-3">Все созданные квитанции</p>
            <p className="text-sm text-gray-600">Найдите, просмотрите или удалите любую квитанцию из архива</p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50 transition">
            <h3 className="text-xl font-bold text-purple-600 mb-3">⚙️ Settings</h3>
            <p className="text-gray-700 mb-3">Параметры приложения</p>
            <p className="text-sm text-gray-600">Установите название организации, номер телефона и размер текста</p>
          </div>
        </div>
      </section>

      {/* Section 3: Tenant Management */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">👥 Управление арендаторами (Tenants)</h2>
        
        <p className="text-gray-700 mb-8">
          Здесь вы видите список всех арендаторов и можете управлять их данными.
        </p>

        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-8 mb-8">
          <p className="text-center text-gray-600 italic mb-4">📸 На этой вкладке вы видите таблицу со всеми жильцами</p>
          <p className="text-center text-sm text-gray-500">[Скриншот: Tenant Management таблица]</p>
        </div>

        <h3 className="text-2xl font-bold mb-6">Что здесь можно делать?</h3>

        <div className="space-y-6">
          {/* Add Tenant */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-4">➕ Добавить нового арендатора</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Нажмите кнопку <span className="bg-blue-200 px-3 py-1 rounded font-semibold">+ Add Tenant</span></p>
              <p><strong>2.</strong> Заполните информацию:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Full Name</strong> — ФИ арендатора (обязательное поле)</li>
                <li><strong>Address</strong> — адрес жилья</li>
                <li><strong>Phone Number</strong> — номер телефона</li>
                <li><strong>Move-in Date</strong> — дата, когда жилец въехал</li>
                <li><strong>Monthly Rent</strong> — размер ежемесячной аренды</li>
                <li><strong>Weekly Tenant Payment</strong> — еженедельный платёж от жильца</li>
                <li><strong>Weekly RAS Amount</strong> — еженедельный взнос RAS</li>
              </ul>
              <p><strong>3.</strong> Нажмите <span className="bg-blue-200 px-3 py-1 rounded font-semibold">Save</span></p>
            </div>
          </div>

          {/* Edit Tenant */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h4 className="text-xl font-bold text-green-700 mb-4">✏️ Отредактировать данные арендатора</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Найдите арендатора в таблице</p>
              <p><strong>2.</strong> На мобильных: нажмите на карточку жилца → <span className="bg-green-200 px-3 py-1 rounded font-semibold">Edit</span></p>
              <p><strong>3.</strong> На компьютере: нажмите значок ✏️ в строке</p>
              <p><strong>4.</strong> Измените нужные данные</p>
              <p><strong>5.</strong> Нажмите <span className="bg-green-200 px-3 py-1 rounded font-semibold">Update</span></p>
            </div>
          </div>

          {/* View Profile */}
          <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded">
            <h4 className="text-xl font-bold text-purple-700 mb-4">👤 Посмотреть полный профиль арендатора</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Нажмите на имя арендатора или кнопку <span className="bg-purple-200 px-3 py-1 rounded font-semibold">View</span></p>
              <p><strong>2.</strong> Откроется модальное окно с полной информацией:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Основные данные (имя, адрес, телефон)</li>
                <li>Финансовый статус (сколько оплачено, сколько задолжено)</li>
                <li>Полная история платежей по неделям</li>
              </ul>
            </div>
          </div>

          {/* Delete Tenant */}
          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded">
            <h4 className="text-xl font-bold text-red-700 mb-4">🗑️ Удалить арендатора</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> На мобильных: нажмите на карточку → <span className="bg-red-200 px-3 py-1 rounded font-semibold">Delete</span></p>
              <p><strong>2.</strong> На компьютере: нажмите значок 🗑️ в строке</p>
              <p><strong>3.</strong> Подтвердите удаление</p>
              <p className="mt-4 pt-4 border-t border-red-300">
                ⚠️ <strong>Внимание!</strong> Удаление невозможно отменить. Убедитесь, что вы точно хотите удалить арендатора и всю его историю.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Полезный совет:</strong> Столбец «Balance» показывает, сколько арендатор должен (красное число) или переплатил (зелёное число). Проверяйте его регулярно!
          </p>
        </div>
      </section>

      {/* Section 4: Create Receipt */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">📄 Создание квитанций (Create Receipt)</h2>
        
        <p className="text-gray-700 mb-8">
          Здесь вы создаёте красивые квитанции об оплате за аренду. Это главная функция системы! 🎯
        </p>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-green-800 mb-4">📋 Два способа создания квитанции:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-lg mb-2">1️⃣ Manual Mode</p>
              <p className="text-gray-700 text-sm">Вы вручную вводите все платежи неделя за неделей</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-lg mb-2">2️⃣ Automatic Mode</p>
              <p className="text-gray-700 text-sm">Загружаете PDF выписку банка, система автоматически определяет платежи</p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">✅ Пошаговое создание квитанции (Manual Mode)</h3>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Шаг 1️⃣: Выберите арендатора</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">Нажмите на поле <span className="bg-yellow-200 px-2 py-1 rounded font-semibold">Select Client</span></p>
              <p className="text-gray-700 mb-3">Выберите имя жилца из списка</p>
              <div className="bg-gray-100 p-3 rounded text-sm text-gray-600 italic">
                📸 [Скриншот: выбор клиента]
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Шаг 2️⃣: Установите период (даты)</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">
                <strong>Period Start Date</strong> — дата начала периода (обычно начало месяца)<br/>
                <strong>Period End Date</strong> — дата окончания периода (обычно конец месяца)
              </p>
              <p className="text-gray-600 text-sm">Система автоматически рассчитает количество недель между датами</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Шаг 3️⃣: Введите финансовые данные</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3"><strong>Starting Debt</strong> — сколько арендатор должен было в начале периода</p>
              <p className="text-gray-700 mb-3"><strong>Starting Credit</strong> — сколько оплачено сверх (если есть)</p>
              <p className="text-gray-600 text-sm">💡 Эти значения подгружаются из профиля автоматически, но вы можете их изменить</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Шаг 4️⃣: Добавляйте платежи неделя за неделей</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-4">Для каждой недели в период заполните:</p>
              <ul className="list-none space-y-3">
                <li className="text-gray-700"><strong>📅 Date</strong> — дата недели</li>
                <li className="text-gray-700"><strong>💶 Rent Due</strong> — сумма ежечасной аренды (обычно берётся из профиля)</li>
                <li className="text-gray-700"><strong>✓ Tenant Payment</strong> — сумма платежа от жилца (если он платил)</li>
                <li className="text-gray-700"><strong>✓ RAS Payment</strong> — сумма платежа RAS (если получили)</li>
              </ul>
              <p className="text-gray-600 text-sm mt-4">Нажимайте ✓ (галочку) рядом с суммой, если платёж получен</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Шаг 5️⃣: Просмотрите итоговый баланс</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">Внизу формы вы видите <strong>Preview</strong> с расчётами:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Всего должно было быть рента</li>
                <li>Сколько получили от жилца</li>
                <li>Сколько получили RAS</li>
                <li>Финальный баланс (сколько должен жилец или его переплата)</li>
              </ul>
              <p className="text-green-700 font-bold mt-4">Если всё правильно — переходите к следующему шагу 👇</p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Шаг 6️⃣: Сохраните квитанцию</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">Нажмите кнопку <span className="bg-green-200 px-3 py-1 rounded font-semibold">Generate PDF & Save</span></p>
              <p className="text-gray-700 mb-3">Система создаст красивый PDF-документ и сохранит квитанцию в историю</p>
              <p className="text-green-600 font-bold">✅ Готово! Квитанция создана и сохранена</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Полезный совет:</strong> Создавайте квитанции в конце каждого месяца. Это поможет вам отслеживать платежи и видеть актуальный статус каждого арендатора.
          </p>
        </div>
      </section>

      {/* Section 5: Receipt History */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">📚 История квитанций (Receipt History)</h2>
        
        <p className="text-gray-700 mb-8">
          Архив всех созданных квитанций. Здесь вы можете найти, просмотреть, распечатать или удалить любую квитанцию.
        </p>

        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-8 mb-8">
          <p className="text-center text-gray-600 italic mb-4">📸 На этой вкладке видна таблица всех квитанций</p>
          <p className="text-center text-sm text-gray-500">[Скриншот: Receipt History]</p>
        </div>

        <div className="space-y-6">
          {/* Filtering */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-4">🔍 Фильтрация квитанций</h4>
            <p className="text-gray-700 mb-3">В верхней части есть фильтры:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Select Client</strong> — выберите арендатора, чтобы увидеть только его квитанции</li>
              <li>Квитанции отсортированы по датам (новые сверху)</li>
            </ul>
          </div>

          {/* View & Print */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h4 className="text-xl font-bold text-green-700 mb-4">👁️ Просмотр и печать</h4>
            <p className="text-gray-700 mb-3">На каждой квитанции есть кнопка <span className="bg-green-200 px-3 py-1 rounded font-semibold">View / Print</span></p>
            <p className="text-gray-700">Нажмите её, чтобы:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
              <li>Посмотреть PDF-квитанцию в полном размере</li>
              <li>Распечатать её на принтере</li>
              <li>Скачать на компьютер</li>
            </ul>
          </div>

          {/* Delete */}
          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded">
            <h4 className="text-xl font-bold text-red-700 mb-4">🗑️ Удаление квитанции</h4>
            <p className="text-gray-700 mb-3">Нажмите кнопку <span className="bg-red-200 px-3 py-1 rounded font-semibold">Delete</span></p>
            <p className="text-gray-700">Система попросит подтверждение и <strong>обязательно потребует указать причину удаления</strong> (минимум 6 символов) — нажмите Delete ещё раз, если вы уверены.</p>
            <p className="mt-4 pt-4 border-t border-red-300 text-gray-700">
              ⚠️ <strong>Важно!</strong> Удаление невозможно отменить. Удаляйте только ошибочные квитанции.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Полезный совет:</strong> Перед удалением квитанции сделайте её скриншот или распечатайте для архива. Это поможет избежать потери данных.
          </p>
        </div>
      </section>

      {/* Section 6: Tenant Profile */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">👤 Профиль арендатора (Tenant Profile)</h2>
        
        <p className="text-gray-700 mb-8">
          Когда вы кликаете на имя арендатора, открывается его полная карточка с полной информацией и историей платежей.
        </p>

        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-8 mb-8">
          <p className="text-center text-gray-600 italic mb-4">📸 Модальное окно профиля арендатора</p>
          <p className="text-center text-sm text-gray-500">[Скриншот: Tenant Profile]</p>
        </div>

        <h3 className="text-2xl font-bold mb-6">Что здесь находится?</h3>

        <div className="space-y-6">
          {/* Header */}
          <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded">
            <h4 className="text-xl font-bold text-purple-700 mb-4">👥 Заголовок профиля</h4>
            <p className="text-gray-700">Вверху вы видите:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li>Аватар с инициалами жилца</li>
              <li>Полное имя и адрес</li>
              <li>Номер телефона</li>
              <li>ID арендатора</li>
            </ul>
          </div>

          {/* Financial Overview */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h4 className="text-xl font-bold text-green-700 mb-4">💰 Финансовый статус (4 карточки)</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>💚 Total Paid</strong> — сколько всего жилец оплатил за все время (зелёный цвет)</p>
              <p><strong>💔 Current Debt</strong> — сколько жилец должен прямо сейчас (красный, если есть задолженность)</p>
              <p><strong>💳 Credit</strong> — сколько жилец переплатил (если есть переплата)</p>
              <p><strong>📄 Receipts</strong> — сколько квитанций создано для этого арендатора</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-4">📋 Информация о платежах</h4>
            <p className="text-gray-700 mb-3">Табличка с основными суммами:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li><strong>Weekly Rent</strong> — размер ежечасной аренды</li>
              <li><strong>Weekly Tenant Payment</strong> — еженедельный платёж от жилца</li>
              <li><strong>Weekly RAS</strong> — еженедельный взнос RAS</li>
              <li><strong>Move-in Date</strong> — когда жилец въехал</li>
            </ul>
          </div>

          {/* Payment History */}
          <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded">
            <h4 className="text-xl font-bold text-orange-700 mb-4">📅 История платежей</h4>
            <p className="text-gray-700 mb-3">Список всех квитанций, созданных для этого арендатора, в обратном порядке (новые сверху)</p>
            <p className="text-gray-700 mb-3">Для каждой квитанции вы видите:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li>Период квитанции (с какой даты по какую)</li>
              <li>ID квитанции</li>
              <li>Дата создания</li>
              <li>Еженедельные платежи с галочками ✓</li>
              <li>Общая сумма платежа за месяц</li>
            </ul>
          </div>

          {/* Notes */}
          <div className="border-l-4 border-gray-500 bg-gray-50 p-6 rounded">
            <h4 className="text-xl font-bold text-gray-700 mb-4">📝 Примечания</h4>
            <p className="text-gray-700">Если у жилца есть заметки (например, причина задолженности или специальные условия), они отобразятся здесь</p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Полезный совет:</strong> Регулярно проверяйте профили арендаторов, чтобы видеть актуальный статус платежей и своевременно заметить задолженности.
          </p>
        </div>
      </section>

      {/* Section 7: Tips & FAQ */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">💡 Полезные советы и часто задаваемые вопросы</h2>

        <div className="space-y-8">
          {/* Tip 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-blue-800 mb-3">✅ Как регулярно создавать квитанции?</h3>
            <p className="text-gray-700 mb-3">
              <strong>Лучшая практика:</strong> Создавайте квитанцию в конце каждого месяца или каждой недели, в зависимости от вашего графика работы.
            </p>
            <p className="text-gray-700">
              Установите себе напоминание (в календаре или телефоне) на конец месяца. Так вы никогда не забудете создать квитанцию и не потеряете данные о платежах.
            </p>
          </div>

          {/* Tip 2 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-green-800 mb-3">✅ Что делать, если арендатор переплатил?</h3>
            <p className="text-gray-700 mb-3">
              Если жилец оплатил больше, чем должен, система автоматически покажет это как <strong>Credit (кредит)</strong> в следующей квитанции.
            </p>
            <p className="text-gray-700">
              Вы можете либо:
            </p>
            <ul className="list-none space-y-2 mt-3">
              <li className="text-gray-700">— Отнять эту сумму из следующего платежа (система сделает это автоматически)</li>
              <li className="text-gray-700">— Вернуть переплату жилцу (запишите это в примечания к профилю)</li>
            </ul>
          </div>

          {/* Tip 3 */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-100 border-2 border-orange-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-orange-800 mb-3">✅ Как исправить ошибку в квитанции?</h3>
            <p className="text-gray-700 mb-3">
              Если вы заметили ошибку в уже созданной квитанции:
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-3">
              <li>Перейдите в <strong>Receipt History</strong></li>
              <li>Найдите ошибочную квитанцию</li>
              <li>Нажмите <strong>Delete</strong></li>
              <li>Создайте новую квитанцию с правильными данными</li>
            </ul>
          </div>

          {/* Tip 4 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-100 border-2 border-purple-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-purple-800 mb-3">✅ Как печатать квитанции для архива?</h3>
            <p className="text-gray-700 mb-3">
              Квитанции можно распечатать для физического архива:
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-3">
              <li>Перейдите в <strong>Receipt History</strong></li>
              <li>Нажмите <strong>View / Print</strong> на нужной квитанции</li>
              <li>Нажмите <strong>Ctrl+P</strong> (или Cmd+P на Mac)</li>
              <li>Выберите принтер и печатайте!</li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-red-800 mb-3">❓ Часто задаваемые вопросы</h3>
            
            <div className="space-y-6 mt-6">
              <div>
                <p className="font-bold text-gray-800 mb-2">В: Что такое «Weekly RAS Amount»?</p>
                <p className="text-gray-700">О: RAS — это внешний платёж (обычно коммунальные услуги). Система отслеживает его отдельно от платежа жилца.</p>
              </div>

              <div className="border-t border-red-200 pt-4">
                <p className="font-bold text-gray-800 mb-2">В: Могу ли я редактировать уже созданную квитанцию?</p>
                <p className="text-gray-700">О: Нет, квитанции нельзя редактировать. Но вы можете удалить её и создать новую с правильными данными.</p>
              </div>

              <div className="border-t border-red-200 pt-4">
                <p className="font-bold text-gray-800 mb-2">В: Где хранятся квитанции? Безопасно ли?</p>
                <p className="text-gray-700">О: Все квитанции хранятся в защищённой облачной базе данных. Доступ имеет только вы (и люди из вашей организации, если добавлены).</p>
              </div>

              <div className="border-t border-red-200 pt-4">
                <p className="font-bold text-gray-800 mb-2">В: Что делать, если я забыл пароль?</p>
                <p className="text-gray-700">О: На экране входа есть ссылка «Forgot Password». Нажмите её и следуйте инструкциям для восстановления.</p>
              </div>

              <div className="border-t border-red-200 pt-4">
                <p className="font-bold text-gray-800 mb-2">В: Можно ли работать с приложением на телефоне?</p>
                <p className="text-gray-700">О: Да! Приложение полностью адаптировано для мобильных устройств. Все функции доступны на телефоне и планшете.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Tools */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">🛠️ Инструменты (Tools)</h2>
        
        <p className="text-gray-700 mb-8">
          Дополнительные утилиты для работы с данными, анализа и генерации отчетов.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-2">🏷️ Address Labels</h4>
            <p className="text-gray-700">Печать наклеек с адресами арендаторов на листах формата А4 для почтовой рассылки.</p>
          </div>

          <div className="border-l-4 border-emerald-500 bg-emerald-50 p-6 rounded">
            <h4 className="text-xl font-bold text-emerald-700 mb-2">📊 Rent Report</h4>
            <p className="text-gray-700">Создание сводного PDF-отчета по всем арендаторам с информацией о платежах и долгах.</p>
          </div>

          <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded">
            <h4 className="text-xl font-bold text-purple-700 mb-2">📈 Arrears Overview</h4>
            <p className="text-gray-700">Визуальный график, отображающий общую задолженность и тенденции по месяцам.</p>
          </div>

          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded">
            <h4 className="text-xl font-bold text-red-700 mb-2">🔔 Arrears Alert</h4>
            <p className="text-gray-700">Вывод списка арендаторов, чья задолженность превышает установленный вами лимит.</p>
          </div>

          <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded">
            <h4 className="text-xl font-bold text-orange-700 mb-2">✉️ Bulk Letters</h4>
            <p className="text-gray-700">Массовая генерация персонализированных писем-уведомлений о задолженности.</p>
          </div>

          <div className="border-l-4 border-cyan-500 bg-cyan-50 p-6 rounded">
            <h4 className="text-xl font-bold text-cyan-700 mb-2">🔍 Payment Lookup</h4>
            <p className="text-gray-700">Глобальный поиск конкретного платежа по всем выданным квитанциям.</p>
          </div>

          <div className="border-l-4 border-violet-500 bg-violet-50 p-6 rounded">
            <h4 className="text-xl font-bold text-violet-700 mb-2">📅 Statement Calendar</h4>
            <p className="text-gray-700">Удобная таблица, показывающая закрытые месяцы для каждого арендатора.</p>
          </div>

          <div className="border-l-4 border-teal-500 bg-teal-50 p-6 rounded">
            <h4 className="text-xl font-bold text-teal-700 mb-2">📥 Export to Excel</h4>
            <p className="text-gray-700">Экспорт всех данных (балансы и транзакции) в формат CSV/Excel для внешнего анализа.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">🎉 Вы готовы к работе!</h2>
        <p className="text-xl mb-6">
          Теперь вы знаете, как использовать <strong>St. Vincent de Paul CRM</strong>
        </p>
        <p className="text-lg opacity-90">
          Если у вас возникли вопросы — не стесняйтесь спрашивать коллег или администратора системы.
        </p>
        <p className="text-lg mt-6 opacity-90">
          💪 Удачи в управлении арендаторами!
        </p>
      </section>
    </div>
  );
}