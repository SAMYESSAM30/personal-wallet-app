// Parse Arabic voice text to extract transaction details
export interface ParsedTransaction {
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'income';
}

// Arabic category mappings
const categoryKeywords: Record<string, string[]> = {
  'طعام': ['طعام', 'أكل', 'مطعم', 'غذاء', 'وجبة', 'سوبرماركت', 'سوق', 'مقهى', 'قهوة', 'مشروب'],
  'مواصلات': ['مواصلات', 'سيارة', 'تاكسي', 'أوبر', 'باص', 'مترو', 'بنزين', 'وقود', 'نقل'],
  'ترفيه': ['ترفيه', 'سينما', 'فيلم', 'لعبة', 'حديقة', 'نزهة', 'تسلية', 'ملهى'],
  'صحة': ['صحة', 'طبيب', 'مستشفى', 'دواء', 'صيدلية', 'علاج', 'فحص', 'جيم', 'نادي'],
  'ملابس': ['ملابس', 'ثوب', 'قميص', 'بنطلون', 'حذاء', 'أزياء', 'تسوق ملابس'],
  'فواتير': ['فاتورة', 'كهرباء', 'ماء', 'إنترنت', 'هاتف', 'جوال', 'فاتورة كهرباء', 'فاتورة ماء'],
  'تسوق': ['تسوق', 'شراء', 'سوق', 'مول', 'متجر', 'مشتريات'],
  'راتب': ['راتب', 'مرتب', 'دخل', 'راتب شهري'],
  'عمل حر': ['عمل حر', 'مشروع', 'عمل', 'عقد'],
  'استثمار': ['استثمار', 'سهم', 'سند', 'استثمارات'],
  'هدية': ['هدية', 'عطية'],
  'مكافأة': ['مكافأة', 'مكافآت', 'بونص'],
};

// Extract amount from Arabic text
function extractAmount(text: string): number | null {
  // Match numbers in Arabic or English
  const numberPattern = /(\d+(?:\.\d+)?)/;
  const match = text.match(numberPattern);
  
  if (match) {
    return parseFloat(match[1]);
  }

  // Try to match Arabic number words (basic)
  const arabicNumbers: Record<string, number> = {
    'واحد': 1, 'اثنين': 2, 'ثلاثة': 3, 'أربعة': 4, 'خمسة': 5,
    'ستة': 6, 'سبعة': 7, 'ثمانية': 8, 'تسعة': 9, 'عشرة': 10,
    'عشرين': 20, 'ثلاثين': 30, 'أربعين': 40, 'خمسين': 50,
    'ستين': 60, 'سبعين': 70, 'ثمانين': 80, 'تسعين': 90,
    'مئة': 100, 'مائة': 100, 'ألف': 1000,
  };

  for (const [word, value] of Object.entries(arabicNumbers)) {
    if (text.includes(word)) {
      return value;
    }
  }

  return null;
}

// Extract category from text
function extractCategory(text: string): string {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'أخرى';
}

// Determine transaction type
function determineType(text: string): 'expense' | 'income' {
  const incomeKeywords = ['راتب', 'مرتب', 'دخل', 'عمل حر', 'استثمار', 'هدية', 'مكافأة'];
  const lowerText = text.toLowerCase();
  
  for (const keyword of incomeKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'income';
    }
  }

  return 'expense';
}

export function parseVoiceText(text: string): ParsedTransaction | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  const amount = extractAmount(text);
  if (!amount || amount <= 0) {
    return null;
  }

  const category = extractCategory(text);
  const type = determineType(text);
  
  // Use the text as description, or create a simple one
  const description = text.trim();

  return {
    amount,
    description,
    category,
    type,
  };
}

