import type {
  AuditAction,
  AuditEntityType,
  AuditLog,
  DetailKind,
  EditorialRole,
  EditorialState,
  EquipmentBrand,
  EquipmentType,
  Locale,
  MediaAsset,
  MediaKind,
  MediaRole,
  Product,
  ProductDetail,
  ProductFeature,
  ProductImage,
  ProductMedium,
  ProductRevision,
  ProductStatus,
  ProductTranslation,
  ProductType,
  StaffMember,
} from "@/lib/db/schema";

export type {
  AuditAction,
  AuditEntityType,
  AuditLog,
  DetailKind,
  EditorialRole,
  EditorialState,
  EquipmentBrand,
  EquipmentType,
  Locale,
  MediaAsset,
  MediaKind,
  MediaRole,
  Product,
  ProductDetail,
  ProductFeature,
  ProductImage,
  ProductMedium,
  ProductRevision,
  ProductStatus,
  ProductTranslation,
  ProductType,
  StaffMember,
};

export type ProductWithRelations = Product & {
  translations: ProductTranslation[];
  details: ProductDetail[];
  features: ProductFeature[];
  images: ProductImage[];
};

export type CoffeeProduct = ProductWithRelations & {
  type: "coffee";
};

export type EquipmentProduct = ProductWithRelations & {
  type: "equipment";
  brand: EquipmentBrand;
  equipmentType: EquipmentType;
};
