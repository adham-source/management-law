import { z } from 'zod';
import i18next from '../config/i18n.config';

// --- Egyptian National ID Validator ---
const governorateCodes = new Set([
    '01', '02', '03', '04', '11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '23', '24', '25', '26', '27', '28', '29', '31', '32', '33', '34', '35', '88'
]);

const isValidEgyptianNID = (nid: string): boolean => {
    if (!/^[23]\d{13}$/.test(nid)) return false; // Must be 14 digits, starting with 2 or 3

    const century = parseInt(nid[0]);
    const year = parseInt(nid.substring(1, 3));
    const month = parseInt(nid.substring(3, 5));
    const day = parseInt(nid.substring(5, 7));
    const govCode = nid.substring(7, 9);

    // Validate governorate code
    if (!governorateCodes.has(govCode)) return false;

    // Validate date
    const birthYear = (century === 2 ? 1900 : 2000) + year;
    const date = new Date(birthYear, month - 1, day);
    if (date.getFullYear() !== birthYear || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return false;
    }

    // Validate checksum
    let sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(nid[i]) * (14 - i);
    }
    const checksum = (sum % 11) === 0 ? 1 : 11 - (sum % 11);
    return checksum === parseInt(nid[13]);
};

const egyptianNIDSchema = z.string().refine(isValidEgyptianNID, {
    message: i18next.t('validation:invalid_egyptian_nid'),
});

// --- Schemas ---

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  governorate: z.string(),
  zip: z.string().optional(),
});

const contactPersonSchema = z.object({
    name: z.string().min(3, i18next.t('validation:contact_person_name_min')),
    email: z.string().email(i18next.t('validation:invalid_email')).optional(),
    phone: z.string(),
});

const emergencyContactSchema = z.object({
    name: z.string().min(3, i18next.t('validation:emergency_contact_name_min')),
    relationship: z.string(),
    phone: z.string(),
});

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(3, i18next.t('validation:name_min')),
    nationalId: egyptianNIDSchema.optional(),
    address: addressSchema.optional(),
    phoneNumbers: z.array(z.string()).min(1, i18next.t('validation:at_least_one_phone')),
    email: z.string().email(i18next.t('validation:invalid_email')).optional(),
    clientType: z.enum(['individual', 'corporate']),
    contactPerson: contactPersonSchema.optional(),
    emergencyContact: emergencyContactSchema.optional(),
    notes: z.string().optional(),
  }).refine(data => {
    if (data.clientType === 'corporate' && !data.contactPerson) {
        return false;
    }
    return true;
  }, { message: i18next.t('validation:contact_person_required_for_corporate') })
});

export const updateClientSchema = z.object({
  body: z.object({
    name: z.string().min(3, i18next.t('validation:name_min')).optional(),
    nationalId: egyptianNIDSchema.optional(),
    address: addressSchema.optional(),
    phoneNumbers: z.array(z.string()).min(1, i18next.t('validation:at_least_one_phone')).optional(),
    email: z.string().email(i18next.t('validation:invalid_email')).optional(),
    clientType: z.enum(['individual', 'corporate']).optional(),
    contactPerson: contactPersonSchema.optional(),
    emergencyContact: emergencyContactSchema.optional(),
    notes: z.string().optional(),
  }),
});