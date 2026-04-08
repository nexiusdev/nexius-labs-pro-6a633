-- Extend SKU registry with Gitea package source mapping metadata.

alter table nexius_os.sku_registry
  add column if not exists source_owner text,
  add column if not exists source_repo text,
  add column if not exists source_ref text,
  add column if not exists source_subdir text,
  add column if not exists manifest_digest text,
  add column if not exists display_name text,
  add column if not exists category text,
  add column if not exists deprecated_at timestamptz;

create index if not exists idx_sku_registry_active_sku_code
  on nexius_os.sku_registry(active, sku_code);

create index if not exists idx_sku_registry_source_ref
  on nexius_os.sku_registry(source_owner, source_repo, source_ref);

alter table nexius_os.sku_registry
  drop constraint if exists sku_registry_source_fields_check;

alter table nexius_os.sku_registry
  add constraint sku_registry_source_fields_check
  check (
    (
      source_owner is null and source_repo is null and source_ref is null and source_subdir is null
    ) or (
      source_owner is not null and source_owner <> '' and
      source_repo is not null and source_repo <> '' and
      source_ref is not null and source_ref <> ''
    )
  );

comment on column nexius_os.sku_registry.source_owner is 'Gitea owner/org for package source';
comment on column nexius_os.sku_registry.source_repo is 'Gitea repository for package source';
comment on column nexius_os.sku_registry.source_ref is 'Git ref/tag/branch for package source';
comment on column nexius_os.sku_registry.source_subdir is 'Package sub-directory inside repository';
