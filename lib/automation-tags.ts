export const automationTags = [
  { id: 'make', label: 'Make.com' },
  { id: 'n8n', label: 'n8n' },
  { id: 'zapier', label: 'Zapier' },
  { id: 'integromat', label: 'Integromat' },
  { id: 'shopify', label: 'Shopify' },
  { id: 'woocommerce', label: 'WooCommerce' },
  { id: 'google', label: 'Google Workspace' }
] as const;

export type AutomationTag = (typeof automationTags)[number]['id'];
