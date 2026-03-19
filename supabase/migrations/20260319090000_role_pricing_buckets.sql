-- Role anchor pricing buckets
-- A = 99, B = 199, C = 399 (SGD)

alter table nexius_os.roles
  add column if not exists pricing_bucket text,
  add column if not exists monthly_price_sgd numeric(10,2);

update nexius_os.roles
set
  pricing_bucket = case
    when lower(title) like '%legal%'
      or lower(title) like '%compliance%'
      or lower(title) like '%treasury%'
      or lower(title) like '%strategy%'
      or lower(title) like '%planning lead%'
      or lower(title) like '%profitability%'
      or lower(title) like '%commercial finance%'
      or lower(title) like '%financial reporting%'
      or lower(title) like '%payroll%'
      or lower(title) like '%platform lead%'
      or lower(title) like '%workforce planning%'
      or lower(title) like '%product costing%'
      or lower(title) like '%production planning%'
      then 'C'

    when lower(title) like '%data entry%'
      or lower(title) like '%steward%'
      or lower(title) like '%coordinator%'
      or lower(title) like '%onboarding specialist%'
      or lower(title) like '%leave & attendance%'
      or lower(title) like '%lead qualification%'
      or lower(title) like '%assistant%'
      then 'A'

    else 'B'
  end,
  monthly_price_sgd = case
    when lower(title) like '%legal%'
      or lower(title) like '%compliance%'
      or lower(title) like '%treasury%'
      or lower(title) like '%strategy%'
      or lower(title) like '%planning lead%'
      or lower(title) like '%profitability%'
      or lower(title) like '%commercial finance%'
      or lower(title) like '%financial reporting%'
      or lower(title) like '%payroll%'
      or lower(title) like '%platform lead%'
      or lower(title) like '%workforce planning%'
      or lower(title) like '%product costing%'
      or lower(title) like '%production planning%'
      then 399

    when lower(title) like '%data entry%'
      or lower(title) like '%steward%'
      or lower(title) like '%coordinator%'
      or lower(title) like '%onboarding specialist%'
      or lower(title) like '%leave & attendance%'
      or lower(title) like '%lead qualification%'
      or lower(title) like '%assistant%'
      then 99

    else 199
  end;

alter table nexius_os.roles
  alter column pricing_bucket set not null,
  alter column monthly_price_sgd set not null;

alter table nexius_os.roles
  add constraint roles_pricing_bucket_check
  check (pricing_bucket in ('A', 'B', 'C'));
