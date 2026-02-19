import React from 'react';

export default function UserGuideEN() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">👋 Welcome to St. Vincent de Paul CRM</h1>
        <p className="text-xl text-gray-600 font-light">
          Your reliable assistant for managing tenants and payment receipts 📊
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
            <div><strong>Main Navigation</strong> — how to move between sections</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div><strong>Tenant Management</strong> — adding, editing, viewing profiles</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">4️⃣</span>
            <div><strong>Creating Receipts</strong> — step-by-step guide</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">5️⃣</span>
            <div><strong>Receipt History</strong> — viewing and managing receipts</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">6️⃣</span>
            <div><strong>Tenant Profile</strong> — complete information and history</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">7️⃣</span>
            <div><strong>Tips & FAQ</strong> — best practices and common questions</div>
          </div>
        </div>
      </div>

      {/* Section 1: Introduction */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">🎯 What is St. Vincent de Paul CRM?</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
          <p className="text-lg text-gray-700 mb-4">
            <strong>St. Vincent de Paul CRM</strong> is a <em>modern tenant management system</em>, designed specifically for organizations managing residential properties.
          </p>
          <p className="text-lg text-gray-700">
            With its help, you'll be able to:
          </p>
          <ul className="list-none space-y-3 mt-4 ml-4">
            <li className="text-gray-700"><strong>✅ Quickly find information</strong> about tenants — names, addresses, payment status</li>
            <li className="text-gray-700"><strong>✅ Create beautiful receipts</strong> for rent payments in just a few clicks</li>
            <li className="text-gray-700"><strong>✅ Track payments</strong> — how much was received, how much is owed</li>
            <li className="text-gray-700"><strong>✅ View complete history</strong> of each tenant and all payments</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
          <p className="text-gray-700">
            💡 <strong>Helpful tip:</strong> The system works perfectly on phones, tablets, and computers. You can work from anywhere!
          </p>
        </div>
      </section>

      {/* Section 2: Navigation */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">🧭 Main Navigation</h2>
        
        <p className="text-gray-700 mb-8">
          At the top of the app, you'll find <strong>four main tabs</strong>. Click on any tab to navigate:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition">
            <h3 className="text-xl font-bold text-blue-600 mb-3">👥 Tenants</h3>
            <p className="text-gray-700 mb-3">Manage all your tenants</p>
            <p className="text-sm text-gray-600">Add new tenants, edit their information, view payment balances</p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-400 hover:bg-green-50 transition">
            <h3 className="text-xl font-bold text-green-600 mb-3">📄 Create Receipt</h3>
            <p className="text-gray-700 mb-3">Generate new payment receipts</p>
            <p className="text-sm text-gray-600">Select a tenant and quickly create a beautiful payment receipt</p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-400 hover:bg-orange-50 transition">
            <h3 className="text-xl font-bold text-orange-600 mb-3">📚 Receipt History</h3>
            <p className="text-gray-700 mb-3">Access all created receipts</p>
            <p className="text-sm text-gray-600">Find, view, or delete any receipt from your archive</p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50 transition">
            <h3 className="text-xl font-bold text-purple-600 mb-3">⚙️ Settings</h3>
            <p className="text-gray-700 mb-3">App settings</p>
            <p className="text-sm text-gray-600">Configure organization name, phone number, and text size</p>
          </div>
        </div>
      </section>

      {/* Section 3: Tenant Management */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">👥 Tenant Management</h2>
        
        <p className="text-gray-700 mb-8">
          View all your tenants and manage their information in one place.
        </p>

        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-8 mb-8">
          <p className="text-center text-gray-600 italic mb-4">📸 Table showing all tenants with ID, name, and balance</p>
          <p className="text-center text-sm text-gray-500">[Screenshot: Tenant Management]</p>
        </div>

        <h3 className="text-2xl font-bold mb-6">What can you do here?</h3>

        <div className="space-y-6">
          {/* Add Tenant */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-4">➕ Add a New Tenant</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Click the <span className="bg-blue-200 px-3 py-1 rounded font-semibold">+ Add Tenant</span> button</p>
              <p><strong>2.</strong> Fill in the information:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Full Name</strong> — tenant's name (required)</li>
                <li><strong>Address</strong> — property address</li>
                <li><strong>Phone Number</strong> — contact number</li>
                <li><strong>Move-in Date</strong> — when the tenant moved in</li>
                <li><strong>Monthly Rent</strong> — monthly rent amount</li>
                <li><strong>Weekly Tenant Payment</strong> — weekly payment from tenant</li>
                <li><strong>Weekly RAS Amount</strong> — weekly RAS contribution</li>
              </ul>
              <p><strong>3.</strong> Click <span className="bg-blue-200 px-3 py-1 rounded font-semibold">Save</span></p>
            </div>
          </div>

          {/* Edit Tenant */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h4 className="text-xl font-bold text-green-700 mb-4">✏️ Edit Tenant Information</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Find the tenant in the list</p>
              <p><strong>2.</strong> On mobile: tap the card → <span className="bg-green-200 px-3 py-1 rounded font-semibold">Edit</span></p>
              <p><strong>3.</strong> On desktop: click the ✏️ icon in the row</p>
              <p><strong>4.</strong> Update the information</p>
              <p><strong>5.</strong> Click <span className="bg-green-200 px-3 py-1 rounded font-semibold">Update</span></p>
            </div>
          </div>

          {/* View Profile */}
          <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded">
            <h4 className="text-xl font-bold text-purple-700 mb-4">👤 View Tenant Profile</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Click on the tenant's name or <span className="bg-purple-200 px-3 py-1 rounded font-semibold">View</span> button</p>
              <p><strong>2.</strong> A detailed profile window opens showing:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Basic information (name, address, phone)</li>
                <li>Financial status (total paid, amount owed)</li>
                <li>Complete payment history by week</li>
              </ul>
            </div>
          </div>

          {/* Delete Tenant */}
          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded">
            <h4 className="text-xl font-bold text-red-700 mb-4">🗑️ Delete a Tenant</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> On mobile: tap the card → <span className="bg-red-200 px-3 py-1 rounded font-semibold">Delete</span></p>
              <p><strong>2.</strong> On desktop: click the 🗑️ icon in the row</p>
              <p><strong>3.</strong> Confirm the deletion</p>
              <p className="mt-4 pt-4 border-t border-red-300">
                ⚠️ <strong>Warning!</strong> Deletion cannot be undone. Make sure you want to delete this tenant and their entire history.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Helpful tip:</strong> The "Balance" column shows how much a tenant owes (red number) or has overpaid (green number). Check it regularly!
          </p>
        </div>
      </section>

      {/* Section 4: Create Receipt */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">📄 Creating Payment Receipts</h2>
        
        <p className="text-gray-700 mb-8">
          Create beautiful payment receipts here. This is the main feature of the system! 🎯
        </p>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-green-800 mb-4">📋 Two ways to create a receipt:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-lg mb-2">1️⃣ Manual Mode</p>
              <p className="text-gray-700 text-sm">You manually enter all payments week by week</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-lg mb-2">2️⃣ Automatic Mode</p>
              <p className="text-gray-700 text-sm">Upload a bank statement PDF, system auto-detects payments</p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">✅ Step-by-Step Receipt Creation (Manual Mode)</h3>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 1️⃣: Select a Tenant</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">Click the <span className="bg-yellow-200 px-2 py-1 rounded font-semibold">Select Client</span> field</p>
              <p className="text-gray-700 mb-3">Choose the tenant from the list</p>
              <div className="bg-gray-100 p-3 rounded text-sm text-gray-600 italic">
                📸 [Screenshot: selecting a client]
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 2️⃣: Set the Period (Dates)</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">
                <strong>Period Start Date</strong> — start of the period (usually month start)<br/>
                <strong>Period End Date</strong> — end of the period (usually month end)
              </p>
              <p className="text-gray-600 text-sm">The system automatically calculates the number of weeks between dates</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 3️⃣: Enter Financial Data</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3"><strong>Starting Debt</strong> — amount owed at period start</p>
              <p className="text-gray-700 mb-3"><strong>Starting Credit</strong> — overpayment if any</p>
              <p className="text-gray-600 text-sm">💡 These values load automatically from the profile, but you can adjust them</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 4️⃣: Add Weekly Payments</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-4">For each week in the period, fill in:</p>
              <ul className="list-none space-y-3">
                <li className="text-gray-700"><strong>📅 Date</strong> — date of the week</li>
                <li className="text-gray-700"><strong>💶 Rent Due</strong> — weekly rent amount</li>
                <li className="text-gray-700"><strong>✓ Tenant Payment</strong> — payment amount from tenant (if paid)</li>
                <li className="text-gray-700"><strong>✓ RAS Payment</strong> — RAS payment received (if any)</li>
              </ul>
              <p className="text-gray-600 text-sm mt-4">Click ✓ (checkmark) next to the amount if payment was received</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 5️⃣: Review Final Balance</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">At the bottom you see the <strong>Preview</strong> with calculations:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Total rent that should have been paid</li>
                <li>Tenant payment received</li>
                <li>RAS payment received</li>
                <li>Final balance (amount owed or overpaid)</li>
              </ul>
              <p className="text-green-700 font-bold mt-4">If everything looks right — move to the next step 👇</p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Step 6️⃣: Save Receipt</h4>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-gray-700 mb-3">Click <span className="bg-green-200 px-3 py-1 rounded font-semibold">Generate PDF & Save</span></p>
              <p className="text-gray-700 mb-3">The system creates a beautiful PDF and saves it to history</p>
              <p className="text-green-600 font-bold">✅ Done! Receipt created and saved</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Helpful tip:</strong> Create receipts at the end of each month. This helps you track payments and see the current status of each tenant.
          </p>
        </div>
      </section>

      {/* Section 5: Receipt History */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">📚 Receipt History</h2>
        
        <p className="text-gray-700 mb-8">
          Archive of all created receipts. Find, view, print, or delete any receipt here.
        </p>

        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-8 mb-8">
          <p className="text-center text-gray-600 italic mb-4">📸 Table showing all receipts</p>
          <p className="text-center text-sm text-gray-500">[Screenshot: Receipt History]</p>
        </div>

        <div className="space-y-6">
          {/* Filtering */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-4">🔍 Filter Receipts</h4>
            <p className="text-gray-700 mb-3">At the top you'll find filters:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Select Client</strong> — choose a tenant to see only their receipts</li>
              <li>Receipts are sorted by date (newest first)</li>
            </ul>
          </div>

          {/* View & Print */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h4 className="text-xl font-bold text-green-700 mb-4">👁️ View & Print</h4>
            <p className="text-gray-700 mb-3">Each receipt has a <span className="bg-green-200 px-3 py-1 rounded font-semibold">View / Print</span> button</p>
            <p className="text-gray-700">Click it to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
              <li>View the PDF receipt in full size</li>
              <li>Print it to your printer</li>
              <li>Download it to your computer</li>
            </ul>
          </div>

          {/* Delete */}
          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded">
            <h4 className="text-xl font-bold text-red-700 mb-4">🗑️ Delete a Receipt</h4>
            <p className="text-gray-700 mb-3">Click the <span className="bg-red-200 px-3 py-1 rounded font-semibold">Delete</span> button</p>
            <p className="text-gray-700">The system will ask for confirmation — click again if you're sure</p>
            <p className="mt-4 pt-4 border-t border-red-300 text-gray-700">
              ⚠️ <strong>Important!</strong> Deletion cannot be undone. Only delete incorrect receipts.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Helpful tip:</strong> Before deleting a receipt, take a screenshot or print it for archive. This prevents data loss.
          </p>
        </div>
      </section>

      {/* Section 6: Tenant Profile */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">👤 Tenant Profile</h2>
        
        <p className="text-gray-700 mb-8">
          When you click on a tenant's name, their complete profile opens with full information and payment history.
        </p>

        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-8 mb-8">
          <p className="text-center text-gray-600 italic mb-4">📸 Tenant profile modal window</p>
          <p className="text-center text-sm text-gray-500">[Screenshot: Tenant Profile]</p>
        </div>

        <h3 className="text-2xl font-bold mb-6">What's in the profile?</h3>

        <div className="space-y-6">
          {/* Header */}
          <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded">
            <h4 className="text-xl font-bold text-purple-700 mb-4">👥 Profile Header</h4>
            <p className="text-gray-700">At the top you see:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li>Avatar with tenant's initials</li>
              <li>Full name and address</li>
              <li>Phone number</li>
              <li>Tenant ID</li>
            </ul>
          </div>

          {/* Financial Overview */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded">
            <h4 className="text-xl font-bold text-green-700 mb-4">💰 Financial Status (4 Cards)</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>💚 Total Paid</strong> — total amount paid by tenant (green)</p>
              <p><strong>💔 Current Debt</strong> — amount owed now (red if any debt)</p>
              <p><strong>💳 Credit</strong> — overpayment if any</p>
              <p><strong>📄 Receipts</strong> — number of receipts created for tenant</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded">
            <h4 className="text-xl font-bold text-blue-700 mb-4">📋 Payment Information</h4>
            <p className="text-gray-700 mb-3">Table with key amounts:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li><strong>Weekly Rent</strong> — weekly rent amount</li>
              <li><strong>Weekly Tenant Payment</strong> — weekly payment from tenant</li>
              <li><strong>Weekly RAS</strong> — weekly RAS contribution</li>
              <li><strong>Move-in Date</strong> — when tenant moved in</li>
            </ul>
          </div>

          {/* Payment History */}
          <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded">
            <h4 className="text-xl font-bold text-orange-700 mb-4">📅 Payment History</h4>
            <p className="text-gray-700 mb-3">List of all receipts for this tenant (newest first)</p>
            <p className="text-gray-700 mb-3">For each receipt you see:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
              <li>Receipt period (from-to dates)</li>
              <li>Receipt ID</li>
              <li>Creation date</li>
              <li>Weekly payments with checkmarks ✓</li>
              <li>Total payment for the month</li>
            </ul>
          </div>

          {/* Notes */}
          <div className="border-l-4 border-gray-500 bg-gray-50 p-6 rounded">
            <h4 className="text-xl font-bold text-gray-700 mb-4">📝 Notes</h4>
            <p className="text-gray-700">If there are notes for a tenant (reasons for debt, special conditions), they appear here</p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mt-8">
          <p className="text-gray-700">
            💡 <strong>Helpful tip:</strong> Check tenant profiles regularly to stay updated on payment status and catch debts early.
          </p>
        </div>
      </section>

      {/* Section 7: Tips & FAQ */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">💡 Tips & Frequently Asked Questions</h2>

        <div className="space-y-8">
          {/* Tip 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-blue-800 mb-3">✅ How to Create Receipts Regularly?</h3>
            <p className="text-gray-700 mb-3">
              <strong>Best practice:</strong> Create a receipt at the end of each month or week, depending on your schedule.
            </p>
            <p className="text-gray-700">
              Set a reminder (in calendar or phone) at month-end. This ensures you never forget and won't lose payment data.
            </p>
          </div>

          {/* Tip 2 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-green-800 mb-3">✅ What if a Tenant Overpaid?</h3>
            <p className="text-gray-700 mb-3">
              If a tenant paid more than owed, the system shows this as <strong>Credit</strong> in the next receipt.
            </p>
            <p className="text-gray-700">
              You can either:
            </p>
            <ul className="list-none space-y-2 mt-3">
              <li className="text-gray-700">— Deduct from next payment (system does this automatically)</li>
              <li className="text-gray-700">— Return the overpayment to tenant (note it in the profile)</li>
            </ul>
          </div>

          {/* Tip 3 */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-100 border-2 border-orange-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-orange-800 mb-3">✅ How to Fix a Receipt Error?</h3>
            <p className="text-gray-700 mb-3">
              If you notice an error in an existing receipt:
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-3">
              <li>Go to <strong>Receipt History</strong></li>
              <li>Find the incorrect receipt</li>
              <li>Click <strong>Delete</strong></li>
              <li>Create a new receipt with correct data</li>
            </ul>
          </div>

          {/* Tip 4 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-100 border-2 border-purple-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-purple-800 mb-3">✅ How to Print Receipts for Archive?</h3>
            <p className="text-gray-700 mb-3">
              You can print receipts for physical records:
            </p>
            <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-3">
              <li>Go to <strong>Receipt History</strong></li>
              <li>Click <strong>View / Print</strong> on desired receipt</li>
              <li>Press <strong>Ctrl+P</strong> (or Cmd+P on Mac)</li>
              <li>Select your printer and print!</li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-300 rounded-xl p-8">
            <h3 className="text-xl font-bold text-red-800 mb-3">❓ Frequently Asked Questions</h3>
            
            <div className="space-y-6 mt-6">
              <div>
                <p className="font-bold text-gray-800 mb-2">Q: What is "Weekly RAS Amount"?</p>
                <p className="text-gray-700">A: RAS is an external payment (usually utilities). The system tracks it separately from tenant payments.</p>
              </div>

              <div className="border-t border-red-200 pt-4">
                <p className="font-bold text-gray-800 mb-2">Q: Can I edit a created receipt?</p>
                <p className="text-gray-700">A: No, receipts can't be edited. But you can delete and create a new one with correct data.</p>
              </div>

              <div className="border-t border-red-200 pt-4">
                <p className="font-bold text-gray-800 mb-2">Q: Where are receipts stored? Is it secure?</p>
                <p className="text-gray-700">A: All receipts are stored in a secure cloud database. Only you (and team members if added) have access.</p>
              </div>

              <div className="border-t border-red-200 pt-4">
                <p className="font-bold text-gray-800 mb-2">Q: What if I forgot my password?</p>
                <p className="text-gray-700">A: There's a "Forgot Password" link on the login screen. Click it and follow the instructions to recover.</p>
              </div>

              <div className="border-t border-red-200 pt-4">
                <p className="font-bold text-gray-800 mb-2">Q: Can I use the app on my phone?</p>
                <p className="text-gray-700">A: Yes! The app is fully optimized for phones and tablets. All features work on mobile.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">🎉 You're Ready to Go!</h2>
        <p className="text-xl mb-6">
          You now know how to use <strong>St. Vincent de Paul CRM</strong>
        </p>
        <p className="text-lg opacity-90">
          If you have questions — don't hesitate to ask colleagues or your system administrator.
        </p>
        <p className="text-lg mt-6 opacity-90">
          💪 Good luck managing your tenants!
        </p>
      </section>
    </div>
  );
}