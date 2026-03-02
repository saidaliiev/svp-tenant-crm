# RentFlow – Tenant & Rent Receipt Manager

**RentFlow** is a complete system for managing tenants, tracking rent payments, and generating professional PDF receipts/statements. Ideal for housing organizations, social charities, hostels, cooperatives, and private landlords.

### Key Features
- Add, edit, and delete tenants (name, full address, phone, rent amount, starting balance/debt/credit)
- Import/export tenant lists via CSV or Excel
- Two receipt creation modes:
  - Manual mode — full control over dates, amounts, notes, and adjustments
  - Automatic mode — upload bank statements → auto-match payments using keywords, amount ranges, and references
- Real-time balance preview (red = owed, green = overpayment/credit)
- Full receipt history with filters by tenant and date range
- Detailed tenant profile showing monthly payment history
- Generate clean, branded PDF receipts ready for printing or emailing
- Organization settings: custom name, contact info, text size on receipts

### Tech Stack
- Frontend: React + Vite
- Backend: Node.js (Express)
- Database: SQLite (dev) / PostgreSQL (production)
- PDF generation: pdf-lib / jsPDF
- Styling: Tailwind CSS

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rentflow.git
   cd rentflow
