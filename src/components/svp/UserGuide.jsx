import React from 'react';

export default function UserGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">👋 Welcome to St. Vincent de Paul CRM</h1>
        <p className="text-xl text-gray-600 font-light">
          Your reliable assistant for managing tenants and receipts 📊
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-blue-50 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">📋 Table of Contents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div><strong>Introduction</strong> — what this system is and how to use it</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div><strong>Main Navigation</strong> — how to navigate between sections</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div><strong>Tenant Management</strong> — add, edit, and view profiles</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">4️⃣</span>
            <div><strong>Create Receipt</strong> — step-by-step guide</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">5️⃣</span>
            <div><strong>Receipt History</strong> — view and manage records</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">6️⃣</span>
            <div><strong>Tenant Profile</strong> — full details and history</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">7️⃣</span>
            <div><strong>Tips & FAQ</strong> — best practices and answers</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">8️⃣</span>
            <div><strong>Tools</strong> — reports, exports, labels, and analytics</div>
          </div>
        </div>
      </div>

      {/* Section 1: Introduction */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">🎯 What is St. Vincent de Paul CRM?</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
          <p className="text-lg text-gray-700 mb-4">
            <strong>St. Vincent de Paul CRM</strong> is a <em>modern tenant management system</em> built specifically for organizations managing housing properties.
          </p>
          <p className="text-lg text-gray-700">
            With it, you can:
          </p>
          <ul className="list-none space-y-3 mt-4 ml-4">
            <li className="text-gray-700"><strong>✅ Quickly find tenant information</strong> — names, addresses, payment status</li>
            <li className="text-gray-700"><strong>✅ Generate beautiful receipts</strong> for rent payments in just a few clicks</li>
            <li className="text-gray-700"><strong>✅ Track payments</strong> — see what is paid and what is owed</li>
            <li className="text-gray-700"><strong>✅ View full history</strong> for each tenant and all their transactions</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
          <p className="text-gray-700">
            💡 <strong>Pro Tip:</strong> The system is fully responsive and works great on your phone, tablet, or computer. You can work from anywhere!
          </p>
        </div>
      </section>

      {/* Section 2: Navigation */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">🧭 Main Navigation</h2>
        
        <p className="text-gray-700 mb-8">
          At the top of the app, you will find <strong>four main tabs</strong>. Click on any to navigate:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition">
            <h3 className="text-xl font-bold text-blue-600 mb-3">👥 Tenants</h3>
            <p className="text-gray-700 mb-3">Manage all your tenants</p>
            <p className="text-sm text-gray-600">Add new tenants, edit their details, and check debt balances</p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-400 hover:bg-green-50 transition">
            <h3 className="text-xl font-bold text-green-600 mb-3">📄 Create Receipt</h3>
            <p className="text-gray-700 mb-3">Generate new payment receipts</p>
            <p className="text-sm text-gray-600">Select a tenant and quickly create a beautiful rent receipt</p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-400 hover:bg-orange-50 transition">
            <h3 className="text-xl font-bold text-orange-600 mb-3">📚 Receipt History</h3>
            <p className="text-gray-700 mb-3">All your generated receipts</p>
            <p className="text-sm text-gray-600">Find, view, print, or delete any receipt from your archives</p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50 transition">
            <h3 className="text-xl font-bold text-purple-600 mb-3">⚙️ Settings</h3>
            <p className="text-gray-700 mb-3">Application preferences</p>
            <p className="text-sm text-gray-600">Set the organization name, contact number, and adjust text size</p>
          </div>
        </div>
      </section>

      {/* Section 3: Tenant Management */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">👥 Tenant Management (Tenants)</h2>
        
        <p className="text-gray-700 mb-8">
          Here you can see the list of all tenants and manage their data.
        </p>

        <h3 className="text-2xl font-bold mb-6">What can you do here?</h3>

        <div className="space-y-6">
          {/* Add Tenant */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-4">➕ Add a New Tenant</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Click the <span className="bg-blue-200 px-3 py-1 rounded font-semibold">+ Add Tenant</span> button</p>
              <p><strong>2.</strong> Fill in their information:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Full Name</strong> — Tenant's full name (required)</li>
                <li><strong>Address</strong> — Housing address</li>
                <li><strong>Phone Number</strong> — Contact number</li>
                <li><strong>Move-in Date</strong> — When they moved in</li>
                <li><strong>Monthly Rent</strong> — The total monthly rent amount</li>
                <li><strong>Weekly Tenant Payment</strong> — The amount expected from the tenant weekly</li>
                <li><strong>Weekly RAS Amount</strong> — The weekly RAS contribution</li>
              </ul>
              <p><strong>3.</strong> Click <span className="bg-blue-200 px-3 py-1 rounded font-semibold">Save</span></p>
            </div>
          </div>

          {/* Edit Tenant */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h4 className="text-xl font-bold text-green-700 mb-4">✏️ Edit Tenant Details</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Find the tenant in the table</p>
              <p><strong>2.</strong> On mobile: tap the tenant card → <span className="bg-green-200 px-3 py-1 rounded font-semibold">Edit</span></p>
              <p><strong>3.</strong> On desktop: click the ✏️ icon in their row</p>
              <p><strong>4.</strong> Update the necessary information</p>
              <p><strong>5.</strong> Click <span className="bg-green-200 px-3 py-1 rounded font-semibold">Update</span></p>
            </div>
          </div>

          {/* View Profile */}
          <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded">
            <h4 className="text-xl font-bold text-purple-700 mb-4">👤 View Full Tenant Profile</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Click the tenant's name or the <span className="bg-purple-200 px-3 py-1 rounded font-semibold">View</span> button</p>
              <p><strong>2.</strong> A modal will open with their complete profile:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Basic info (name, address, phone)</li>
                <li>Financial overview (total paid, current debt)</li>
                <li>Full week-by-week payment history</li>
              </ul>
            </div>
          </div>

          {/* Delete Tenant */}
          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded">
            <h4 className="text-xl font-bold text-red-700 mb-4">🗑️ Delete a Tenant</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> On mobile: tap the card → <span className="bg-red-200 px-3 py-1 rounded font-semibold">Delete</span></p>
              <p><strong>2.</strong> On desktop: click the 🗑️ icon</p>
              <p><strong>3.</strong> Confirm the deletion</p>
              <p className="mt-4 pt-4 border-t border-red-300">
                ⚠️ <strong>Warning!</strong> Deletion cannot be undone. Make sure you want to permanently remove the tenant and their history.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Pro Tip:</strong> The "Balance" column shows how much the tenant owes (red) or overpaid (green). Check this regularly!
          </p>
        </div>
      </section>

      {/* Section 4: Create Receipt */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">📄 Creating Receipts (Create Receipt)</h2>
        
        <p className="text-gray-700 mb-8">
          This is where you generate professional rent receipts. It is the core feature of the system! 🎯
        </p>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-green-800 mb-4">📋 Two ways to create a receipt:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-lg mb-2">1️⃣ Manual Mode</p>
              <p className="text-gray-700 text-sm">You manually enter all payments week by week.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-lg mb-2">2️⃣ Automatic Mode</p>
              <p className="text-gray-700 text-sm">Upload a bank PDF statement, and the system detects payments automatically.</p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">✅ Step-by-Step Guide (Manual Mode)</h3>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 1️⃣: Select the Tenant</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">Click on the <span className="bg-yellow-200 px-2 py-1 rounded font-semibold">Select Client</span> field</p>
              <p className="text-gray-700 mb-3">Pick a tenant from the list.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 2️⃣: Set the Period</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">
                <strong>Start Date</strong> — usually the 1st of the month<br/>
                <strong>End Date</strong> — usually the last day of the month
              </p>
              <p className="text-gray-600 text-sm">The system automatically calculates the weeks in this range.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 3️⃣: Enter Balances</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3"><strong>Starting Debt</strong> — what they owed at the beginning of the period</p>
              <p className="text-gray-700 mb-3"><strong>Credit</strong> — any previous overpayments</p>
              <p className="text-gray-600 text-sm">💡 These auto-populate from their profile, but you can edit them.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 4️⃣: Add Weekly Payments</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-4">For each week, verify:</p>
              <ul className="list-none space-y-3">
                <li className="text-gray-700"><strong>📅 Date</strong> — the week's date</li>
                <li className="text-gray-700"><strong>💶 Rent Due</strong> — amount due (loads from profile)</li>
                <li className="text-gray-700"><strong>✓ Tenant Payment</strong> — amount they paid</li>
                <li className="text-gray-700"><strong>✓ RAS Payment</strong> — amount received from RAS</li>
              </ul>
              <p className="text-gray-600 text-sm mt-4">Check the box ✓ next to an amount to confirm it was paid.</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 5️⃣: Preview Final Balance</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">Scroll down to see the <strong>Preview</strong> panel:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Total Rent Due</li>
                <li>Total Paid by Tenant</li>
                <li>Total RAS Received</li>
                <li>Final Balance (red for debt, green for credit)</li>
              </ul>
              <p className="text-green-700 font-bold mt-4">If it looks correct, proceed below 👇</p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 6️⃣: Generate Receipt</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">Click <span className="bg-green-200 px-3 py-1 rounded font-semibold">Generate PDF & Save</span></p>
              <p className="text-gray-700 mb-3">The system will generate a PDF file and save the record to history.</p>
              <p className="text-green-600 font-bold">✅ Done! The receipt is created.</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Pro Tip:</strong> Try to generate receipts regularly at the end of every month. It keeps the balances accurate and up-to-date!
          </p>
        </div>
      </section>

      {/* Section 5: Receipt History */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">📚 Receipt History</h2>
        
        <p className="text-gray-700 mb-8">
          The archive of all receipts you have generated. You can find, view, print, or delete them here.
        </p>

        <div className="space-y-6">
          {/* Filtering */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-4">🔍 Filtering</h4>
            <p className="text-gray-700 mb-3">Use the dropdown at the top:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Select a specific tenant to only see their past receipts.</li>
              <li>Receipts are sorted by date (newest first).</li>
            </ul>
          </div>

          {/* View & Print */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h4 className="text-xl font-bold text-green-700 mb-4">👁️ View and Print</h4>
            <p className="text-gray-700 mb-3">Click the <span className="bg-green-200 px-3 py-1 rounded font-semibold">View / Print</span> button on any row.</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
              <li>It opens the PDF in a new tab.</li>
              <li>You can print it directly or download it.</li>
            </ul>
          </div>

          {/* Delete */}
          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded">
            <h4 className="text-xl font-bold text-red-700 mb-4">🗑️ Delete a Receipt</h4>
            <p className="text-gray-700 mb-3">Click the <span className="bg-red-200 px-3 py-1 rounded font-semibold">Delete</span> button.</p>
            <p className="text-gray-700">A dialog will appear asking for confirmation and <strong>a mandatory reason (at least 6 characters)</strong> before you can finalize the deletion.</p>
            <p className="mt-4 pt-4 border-t border-red-300 text-gray-700">
              ⚠️ <strong>Warning:</strong> Deletion is permanent. Only delete mistakes.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Tenant Profile */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">👤 Tenant Profile</h2>
        
        <p className="text-gray-700 mb-8">
          Clicking a tenant's name opens their full profile modal.
        </p>

        <h3 className="text-2xl font-bold mb-6">What's inside?</h3>

        <div className="space-y-6">
          {/* Header */}
          <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded">
            <h4 className="text-xl font-bold text-purple-700 mb-4">👥 Header Info</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Tenant initials avatar</li>
              <li>Full name, address, and phone</li>
              <li>Unique ID</li>
            </ul>
          </div>

          {/* Financial Overview */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h4 className="text-xl font-bold text-green-700 mb-4">💰 Financial Overview (4 Cards)</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>💚 Total Paid</strong> — sum of all payments over time</p>
              <p><strong>💔 Current Debt</strong> — current outstanding balance (red if they owe)</p>
              <p><strong>💳 Credit</strong> — current overpayment amount</p>
              <p><strong>📄 Receipts</strong> — total number of receipts generated</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-4">📋 Settings & Rates</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li>Monthly Rent</li>
              <li>Weekly Tenant Portion</li>
              <li>Weekly RAS Amount</li>
              <li>Move-in Date</li>
            </ul>
          </div>

          {/* Payment History */}
          <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded">
            <h4 className="text-xl font-bold text-orange-700 mb-4">📅 Payment History</h4>
            <p className="text-gray-700 mb-3">A chronological list of all saved receipts.</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li>Receipt Period & ID</li>
              <li>Creation Date</li>
              <li>Weekly breakdown (✓ means paid)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 7: Tips & FAQ */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">💡 Tips & FAQ</h2>

        <div className="space-y-8">
          {/* Tip 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-blue-800 mb-3">✅ Generating regular receipts</h3>
            <p className="text-gray-700">
              Set a monthly reminder on your phone or calendar. Creating them consistently ensures your data never falls behind.
            </p>
          </div>

          {/* Tip 2 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-green-800 mb-3">✅ Handling Overpayments (Credit)</h3>
            <p className="text-gray-700 mb-3">
              If a tenant pays extra, it shows up as a Credit. The next time you generate a receipt, the system will apply that credit automatically.
            </p>
          </div>

          {/* FAQ */}
          <div className="bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-red-800 mb-3">❓ Frequently Asked Questions</h3>
            
            <div className="space-y-6 mt-6">
              <div>
                <p className="font-bold text-gray-800 mb-2">Q: Can I edit an existing receipt?</p>
                <p className="text-gray-700">A: No. If you made a mistake, delete the incorrect receipt in History and create a new one.</p>
              </div>

              <div className="border-t border-red-200 pt-4">
                <p className="font-bold text-gray-800 mb-2">Q: Is my data safe?</p>
                <p className="text-gray-700">A: Yes, all data is stored securely in the cloud and backed up automatically.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Tools */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">🛠️ Tools</h2>
        
        <p className="text-gray-700 mb-8">
          Extra utilities for reporting, exporting, and managing bulk data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-2">🏷️ Address Labels</h4>
            <p className="text-gray-700">Print mailing address stickers on standard A4 templates.</p>
          </div>

          <div className="border-l-4 border-emerald-500 bg-emerald-50 p-6 rounded">
            <h4 className="text-xl font-bold text-emerald-700 mb-2">📊 Rent Report</h4>
            <p className="text-gray-700">Generate a comprehensive PDF showing who paid and who owes money.</p>
          </div>

          <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded">
            <h4 className="text-xl font-bold text-purple-700 mb-2">📈 Arrears Overview</h4>
            <p className="text-gray-700">Visual charts mapping total debt across all tenants.</p>
          </div>

          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded">
            <h4 className="text-xl font-bold text-red-700 mb-2">🔔 Arrears Alert</h4>
            <p className="text-gray-700">A quick filter for tenants who have passed your designated debt limit.</p>
          </div>

          <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded">
            <h4 className="text-xl font-bold text-orange-700 mb-2">✉️ Bulk Letters</h4>
            <p className="text-gray-700">Automatically write and print arrears warning letters in bulk.</p>
          </div>

          <div className="border-l-4 border-cyan-500 bg-cyan-50 p-6 rounded">
            <h4 className="text-xl font-bold text-cyan-700 mb-2">🔍 Payment Lookup</h4>
            <p className="text-gray-700">Search for a specific payment amount or date across all history.</p>
          </div>

          <div className="border-l-4 border-violet-500 bg-violet-50 p-6 rounded">
            <h4 className="text-xl font-bold text-violet-700 mb-2">📅 Statement Calendar</h4>
            <p className="text-gray-700">A grid showing which months have closed statements for every tenant.</p>
          </div>

          <div className="border-l-4 border-teal-500 bg-teal-50 p-6 rounded">
            <h4 className="text-xl font-bold text-teal-700 mb-2">📥 Export to Excel</h4>
            <p className="text-gray-700">Export tenant data and all transactions to CSV for Excel.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">🎉 You are ready to go!</h2>
        <p className="text-xl mb-6">
          You now know how to master the <strong>St. Vincent de Paul CRM</strong>.
        </p>
        <p className="text-lg opacity-90">
          Good luck managing your properties!
        </p>
      </section>
    </div>
  );
}