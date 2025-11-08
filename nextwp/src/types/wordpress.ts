// WordPress Core Types
export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
    raw: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private' | 'pending';
  type: 'post' | 'page';
  link: string;
  title: {
    rendered: string;
    raw?: string;
  };
  content: {
    rendered: string;
    raw?: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    raw?: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format: 'standard' | 'aside' | 'chat' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio';
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    author: Array<{ embeddable: boolean; href: string }>;
    replies: Array<{ embeddable: boolean; href: string }>;
    'wp:featuredmedia': Array<{ embeddable: boolean; href: string }>;
    'wp:attachment': Array<{ href: string }>;
    'wp:term': Array<{ taxonomy: string; embeddable: boolean; href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}

export interface WordPressPage extends Omit<WordPressPost, 'type'> {
  type: 'page';
  parent: number;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    'wp:post_type': Array<{ href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    'wp:post_type': Array<{ href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}

export interface WordPressMedia {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
    raw: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'inherit' | 'private' | 'trash';
  type: 'attachment';
  link: string;
  title: {
    rendered: string;
    raw?: string;
  };
  author: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  alt_text: string;
  caption: string;
  description: string;
  media_type: 'image' | 'file' | 'video' | 'audio';
  mime_type: string;
  media_details: {
    width?: number;
    height?: number;
    file?: string;
    sizes?: {
      thumbnail?: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
      medium?: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
      large?: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
      full?: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
  };
  post: number | null;
  source_url: string;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    author: Array<{ embeddable: boolean; href: string }>;
    replies: Array<{ embeddable: boolean; href: string }>;
  };
}

export interface WordPressMenu {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  items: WordPressMenuItem[];
}

export interface WordPressMenuItem {
  id: number;
  title: string;
  url: string;
  attr_title?: string;
  target?: string;
  classes: string[];
  xfn?: string[];
  description?: string;
  object_id: number;
  object: string;
  type: string;
  type_label: string;
  parent: number;
  menu_order: number;
  children?: WordPressMenuItem[];
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
  };
}

// WooCommerce Types
export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  status: 'publish' | 'draft' | 'private' | 'pending';
  featured: boolean;
  catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from?: string;
  date_on_sale_from_gmt?: string;
  date_on_sale_to?: string;
  date_on_sale_to_gmt?: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: WooCommerceDownload[];
  download_limit: number;
  download_expiry: number;
  external_url?: string;
  button_text?: string;
  tax_status: 'taxable' | 'shipping' | 'none';
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  backorders: 'no' | 'notify' | 'yes';
  backorders_allowed?: boolean;
  backordered?: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: WooCommerceProductCategory[];
  tags: WooCommerceProductTag[];
  images: WooCommerceProductImage[];
  attributes: WooCommerceProductAttribute[];
  default_attributes: WooCommerceProductDefaultAttribute[];
  variations: WooCommerceProductVariation[];
  grouped_products: number[];
  menu_order: number;
  meta_data: WooCommerceMetaData[];
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}

export interface WooCommerceProductCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: 'default' | 'products' | 'subcategories' | 'both';
  image?: {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  };
  menu_order: number;
  count: number;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    up: Array<{ href: string }>;
    'wp:post_type': Array<{ href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}

export interface WooCommerceProductTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    'wp:post_type': Array<{ href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}

export interface WooCommerceProductImage {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
  position: number;
}

export interface WooCommerceProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooCommerceProductDefaultAttribute {
  id: number;
  name: string;
  option: string;
}

export interface WooCommerceProductVariation {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  description: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from?: string;
  date_on_sale_from_gmt?: string;
  date_on_sale_to?: string;
  date_on_sale_to_gmt?: string;
  on_sale: boolean;
  status: 'publish' | 'private';
  purchasable: boolean;
  virtual: boolean;
  downloadable: boolean;
  downloads: WooCommerceDownload[];
  download_limit: number;
  download_expiry: number;
  tax_status: 'taxable' | 'shipping' | 'none';
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  backorders: 'no' | 'notify' | 'yes';
  backorders_allowed?: boolean;
  backordered?: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_class: string;
  shipping_class_id: number;
  image?: WooCommerceProductImage;
  attributes: WooCommerceVariationAttribute[];
  menu_order: number;
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceDownload {
  id: string;
  name: string;
  file: string;
}

export interface WooCommerceVariationAttribute {
  id: number;
  name: string;
  option: string;
}

export interface WooCommerceMetaData {
  id: number;
  key: string;
  value: any;
}

// Cart Types
export interface WooCommerceCartItem {
  key: string;
  id: number;
  name: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  quantity: number;
  taxable: boolean;
  tax_status: string;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  image: WooCommerceProductImage;
  variations: Record<string, string>;
  quantity_limits: {
    minimum: number;
    maximum: number;
    multiple_of: number;
  };
  cart_item_data: Record<string, any>;
}

export interface WooCommerceCart {
  items: WooCommerceCartItem[];
  totals: {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string;
    total_shipping_tax: string;
    total_price: string;
    total_tax: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  shipping_rates: WooCommerceShippingRate[];
  coupons: WooCommerceCoupon[];
  payment_methods: WooCommercePaymentMethod[];
  needs_payment: boolean;
  needs_shipping: boolean;
}

export interface WooCommerceShippingRate {
  id: string;
  method_id: string;
  method_title: string;
  instance_id: number;
  label: string;
  cost: string;
  taxes: string;
  chosen: boolean;
}

export interface WooCommerceCoupon {
  code: string;
  discount_type: string;
  amount: string;
}

export interface WooCommercePaymentMethod {
  id: string;
  title: string;
  description: string;
  icon: string;
  chosen: boolean;
}

// Customer Types
export interface WooCommerceCustomer {
  id: number;
  date_created: string;
  date_created_gmt: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: WooCommerceCustomerAddress;
  shipping: WooCommerceCustomerAddress;
  is_paying_customer: boolean;
  orders_count: number;
  total_spent: string;
  avatar_url: string;
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceCustomerAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

// Order Types
export interface WooCommerceOrder {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  created_via: string;
  version: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  currency: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_ip_address: string;
  customer_user_agent: string;
  customer_note: string;
  billing: WooCommerceCustomerAddress;
  shipping: WooCommerceCustomerAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string;
  date_paid_gmt: string;
  date_completed: string;
  date_completed_gmt: string;
  cart_hash: string;
  meta_data: WooCommerceMetaData[];
  line_items: WooCommerceOrderLineItem[];
  tax_lines: WooCommerceOrderTaxLine[];
  shipping_lines: WooCommerceOrderShippingLine[];
  fee_lines: WooCommerceOrderFeeLine[];
  coupon_lines: WooCommerceOrderCouponLine[];
  refunds: WooCommerceOrderRefund[];
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    customer: Array<{ href: string }>;
  };
}

export interface WooCommerceOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: Array<{
    id: number;
    total: string;
    subtotal: string;
  }>;
  meta_data: WooCommerceMetaData[];
  sku: string;
  price: number;
}

export interface WooCommerceOrderTaxLine {
  id: number;
  rate_code: string;
  rate_id: number;
  label: string;
  compound: boolean;
  tax_total: string;
  shipping_tax_total: string;
  rate_percent: number;
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceOrderShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  instance_id: string;
  total: string;
  total_tax: string;
  taxes: Array<{
    id: number;
    total: string;
  }>;
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceOrderFeeLine {
  id: number;
  name: string;
  tax_class: string;
  tax_status: string;
  total: string;
  total_tax: string;
  taxes: Array<{
    id: number;
    total: string;
  }>;
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceOrderCouponLine {
  id: number;
  code: string;
  discount: string;
  discount_tax: string;
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceOrderRefund {
  id: number;
  reason: string;
  total: string;
}

// Review Types
export interface WooCommerceReview {
  id: number;
  product_id: number;
  review: string;
  rating: number;
  reviewer: string;
  reviewer_email: string;
  verified: boolean;
  date_created: string;
  date_created_gmt: string;
}