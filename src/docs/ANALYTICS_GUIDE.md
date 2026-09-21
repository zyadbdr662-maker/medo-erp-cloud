# MeDo ERP - Analytics & Monitoring Documentation

## 📊 Overview
The MeDo ERP system is integrated with a multi-layered analytics engine to monitor performance, user behavior, and conversions.

## 🛠️ Integrated Tools
| Tool | Purpose | Environment Variable |
| :--- | :--- | :--- |
| **Google Analytics 4** | Traffic & Event tracking | `VITE_GA_MEASUREMENT_ID` |
| **Microsoft Clarity** | Session recording & Heatmaps | `VITE_CLARITY_ID` |
| **Hotjar** | Feedback & Behavior analysis | `VITE_HOTJAR_ID` |
| **Facebook Pixel** | Ad conversion & Retargeting | `VITE_FB_PIXEL_ID` |

## 🚀 Custom Events Tracking
The following events are automatically tracked and sent to the dashboards:

### 1. User Engagement
- `trial_started`: Triggered when "Try Free" button is clicked.
- `login`: Triggered on successful user authentication.

### 2. Business Operations
- `invoice_created`: Tracked when a sales or purchase invoice is saved.
- `new_customer`: Tracked when a new customer record is created.
- `new_item`: Tracked when a new inventory item is added.

### 3. Conversions
- `conversion`: Triggered when a user selects a pricing plan.

## 📈 How to access dashboards
1. **Google Analytics**: [analytics.google.com](https://analytics.google.com/)
2. **Clarity**: [clarity.microsoft.com](https://clarity.microsoft.com/)
3. **Hotjar**: [hotjar.com](https://hotjar.com/)
4. **Events Manager (Meta)**: [business.facebook.com](https://business.facebook.com/)

---
*Prepared by MeDo ERP Agent for Bin Ziyad Trading Group.*
