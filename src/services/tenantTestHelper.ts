import { registerSelfServiceTenant, PreGeneratedTenant, getStored200Tenants } from "../data/preGeneratedTenants";
import { InstantNotificationService } from "./notificationService";

export interface TestTenantSeedData {
  nameAr: string;
  nameEn: string;
  industry: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  crNumber: string;
  taxNumber: string;
}

export const SEED_TEST_TENANTS: TestTenantSeedData[] = [
  {
    nameAr: "شركة سبأ الذهبية للتجارة العامة والاستيراد",
    nameEn: "Saba Gold General Trading & Import Co.",
    industry: "تجارة عامة واستيراد وتصدير",
    city: "صنعاء",
    address: "شارع الزبيري - برج سبأ التجاري - الدور الرابع",
    email: "saba.gold.yemen@gmail.com",
    phone: "+967 771 112 233",
    crNumber: "CR-2026-90101",
    taxNumber: "300901010000003",
  },
  {
    nameAr: "مؤسسة الأفق العربي للتوريدات الطبية والحلول",
    nameEn: "Arab Horizon Medical Supplies & Solutions",
    industry: "مستلزمات طبية وأدوية",
    city: "عدن",
    address: "حي المعلا - شارع الدائري - مقابل مستشفى الجمهورية",
    email: "horizon.med.aden@gmail.com",
    phone: "+967 772 223 344",
    crNumber: "CR-2026-90102",
    taxNumber: "300901020000003",
  },
  {
    nameAr: "شركة عدن الوطنية للصناعات الغذائية والتبريد",
    nameEn: "Aden National Food Industries & Cold Storage",
    industry: "صناعات غذائية وتبريد central",
    city: "عدن",
    address: "المنطقة الصناعية - كابوتا - مجمع الثلاجات المركزية",
    email: "aden.food.ind@gmail.com",
    phone: "+967 773 334 455",
    crNumber: "CR-2026-90103",
    taxNumber: "300901030000003",
  },
  {
    nameAr: "مجموعة الخليج الدولية للخدمات اللوجستية والنقل",
    nameEn: "Gulf International Logistics & Cargo Group",
    industry: "شحن ولوجستيات وسلاسل إمداد",
    city: "المكلا",
    address: "شارع الستين - الميناء - مجمع الخليج اللوجستي",
    email: "gulf.cargo.mukalla@gmail.com",
    phone: "+967 774 445 566",
    crNumber: "CR-2026-90104",
    taxNumber: "300901040000003",
  },
  {
    nameAr: "مستشفى السلام الطبي التخصصي ومراكز الأشعة",
    nameEn: "Al-Salam Specialized Medical Hospital",
    industry: "خدمات صحية وطبية تخصصية",
    city: "تعز",
    address: "شارع جمال - مفرق المسبح - برج السلام الطبي",
    email: "salam.hospital.taiz@gmail.com",
    phone: "+967 775 556 677",
    crNumber: "CR-2026-90105",
    taxNumber: "300901050000003",
  },
  {
    nameAr: "مطبعة ومكتبات النهضة الحديثة للتجهيزات",
    nameEn: "Al-Nahda Modern Printing Press & Stationery",
    industry: "طباعة ونشر وتجهيزات مكتبية",
    city: "صنعاء",
    address: "شارع حدة - تقاطع صخر - برج النهضة",
    email: "nahda.press.sanaa@gmail.com",
    phone: "+967 776 667 788",
    crNumber: "CR-2026-90106",
    taxNumber: "300901060000003",
  },
  {
    nameAr: "مصنع حضرموت للرخام والجرانيت ومواد البناء",
    nameEn: "Hadramout Marble & Granite Factory",
    industry: "تصنيع ومواد بناء وسيراميك",
    city: "المكلا",
    address: "منطقة الريان الصناعية - المخطط التجاري",
    email: "hadramout.marble@gmail.com",
    phone: "+967 777 778 899",
    crNumber: "CR-2026-90107",
    taxNumber: "300901070000003",
  },
  {
    nameAr: "شركة مأرب الاستشارية للمقاولات والهندسة",
    nameEn: "Marib Engineering & Contracting Consultancy",
    industry: "مقاولات واستشارات هندسية",
    city: "مأرب",
    address: "شارع المجمع الحكومي - برج مأرب الهندي",
    email: "marib.eng.co@gmail.com",
    phone: "+967 778 889 900",
    crNumber: "CR-2026-90108",
    taxNumber: "300901080000003",
  },
  {
    nameAr: "شبكة الرازي الدوائية للتوكيلات والصيدليات",
    nameEn: "Al-Razi Pharma Agencies & Pharmacy Network",
    industry: "توكيلات دوائية وصيدليات",
    city: "صنعاء",
    address: "شارع 16 - الدائري الغربي - مبنى الرازي",
    email: "alrazi.pharma.agency@gmail.com",
    phone: "+967 779 900 111",
    crNumber: "CR-2026-90109",
    taxNumber: "300901090000003",
  },
  {
    nameAr: "شركة الفخامة لمعدات التكييف والطاقة الشمسية",
    nameEn: "Al-Fakhamah Solar Energy & HVAC Systems",
    industry: "طاقة شمسية وأنظمة تكييف وتبريد",
    city: "الحديدية / عدن",
    address: "شارع المطار - مجمع الفخامة التجاري",
    email: "fakhamah.solar@gmail.com",
    phone: "+967 770 011 222",
    crNumber: "CR-2026-90110",
    taxNumber: "300901100000003",
  },
];

/**
 * Test Helper: Automatically creates 10 realistic demo tenants with full sub-links,
 * notifies Sovereign Admin, and updates localStorage and UI state instantly.
 */
export async function generate10TestTenantsHelper(): Promise<PreGeneratedTenant[]> {
  const createdTenants: PreGeneratedTenant[] = [];
  const notifService = InstantNotificationService.getInstance();

  for (let i = 0; i < SEED_TEST_TENANTS.length; i++) {
    const seed = SEED_TEST_TENANTS[i];
    
    // Register tenant dynamically
    const tenant = registerSelfServiceTenant({
      nameAr: seed.nameAr,
      nameEn: seed.nameEn,
      crNumber: seed.crNumber,
      taxNumber: seed.taxNumber,
      industry: seed.industry,
      address: seed.address,
      city: seed.city,
      email: seed.email,
      phone: seed.phone,
      password: "1234",
    });

    createdTenants.push(tenant);

    // Trigger instant notification payload for each generated tenant
    try {
      await notifService.dispatchNewRegistration({
        tenant,
        ipAddress: "197.230.12.84",
        deviceType: "Test Helper Automator / MeDo Sovereign Suite",
        registeredAt: new Date().toLocaleString("ar-YE"),
      });
    } catch (err) {
      console.warn(`[TestHelper] Notification warn for tenant ${tenant.id}:`, err);
    }
  }

  // Dispatch custom window event so all UI components refresh immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tenants_updated"));
    window.dispatchEvent(new Event("sovereign_admin_refreshed"));
  }

  return createdTenants;
}

/**
 * Returns total stored tenants count including registered and test tenants
 */
export function getTestTenantsSummary() {
  const all = getStored200Tenants();
  return {
    total: all.length,
    list: all,
  };
}
