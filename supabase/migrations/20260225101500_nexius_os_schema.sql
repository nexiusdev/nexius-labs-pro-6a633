--
-- PostgreSQL database dump
--

-- \restrict phWEusKlO0BK3pakeyLnVbfdb7CCxD5Yr7ygkuenFThV5NqTOOvnge96kltTjk6

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: nexius_os; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA IF NOT EXISTS "nexius_os";


ALTER SCHEMA "nexius_os" OWNER TO "postgres";

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: complexity_t; Type: TYPE; Schema: nexius_os; Owner: postgres
--

CREATE TYPE "nexius_os"."complexity_t" AS ENUM (
    'Starter',
    'Intermediate',
    'Advanced'
);


ALTER TYPE "nexius_os"."complexity_t" OWNER TO "postgres";

--
-- Name: governance_t; Type: TYPE; Schema: nexius_os; Owner: postgres
--

CREATE TYPE "nexius_os"."governance_t" AS ENUM (
    'Auto',
    'Approval Required',
    'Exception-only'
);


ALTER TYPE "nexius_os"."governance_t" OWNER TO "postgres";

--
-- Name: outcome_category_t; Type: TYPE; Schema: nexius_os; Owner: postgres
--

CREATE TYPE "nexius_os"."outcome_category_t" AS ENUM (
    'Speed',
    'Reliability',
    'Cashflow',
    'Control'
);


ALTER TYPE "nexius_os"."outcome_category_t" OWNER TO "postgres";

--
-- Name: subscription_status_t; Type: TYPE; Schema: nexius_os; Owner: postgres
--

CREATE TYPE "nexius_os"."subscription_status_t" AS ENUM (
    'initiated',
    'active',
    'past_due',
    'cancelled',
    'failed'
);


ALTER TYPE "nexius_os"."subscription_status_t" OWNER TO "postgres";

--
-- Name: time_to_value_t; Type: TYPE; Schema: nexius_os; Owner: postgres
--

CREATE TYPE "nexius_os"."time_to_value_t" AS ENUM (
    '<2 weeks',
    '2-4 weeks',
    '1-2 months'
);


ALTER TYPE "nexius_os"."time_to_value_t" OWNER TO "postgres";

--
-- Name: workflow_t; Type: TYPE; Schema: nexius_os; Owner: postgres
--

CREATE TYPE "nexius_os"."workflow_t" AS ENUM (
    'CRM',
    'ERP',
    'Finance',
    'HRMS'
);


ALTER TYPE "nexius_os"."workflow_t" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: expert_certifications; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."expert_certifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expert_id" "text" NOT NULL,
    "certification" "text" NOT NULL,
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "nexius_os"."expert_certifications" OWNER TO "postgres";

--
-- Name: expert_education; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."expert_education" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expert_id" "text" NOT NULL,
    "degree" "text",
    "institution" "text",
    "year" "text",
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "nexius_os"."expert_education" OWNER TO "postgres";

--
-- Name: expert_experience; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."expert_experience" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expert_id" "text" NOT NULL,
    "role_title" "text" NOT NULL,
    "company" "text",
    "period_text" "text",
    "description" "text",
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "nexius_os"."expert_experience" OWNER TO "postgres";

--
-- Name: expert_expertise; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."expert_expertise" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expert_id" "text" NOT NULL,
    "expertise" "text" NOT NULL,
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "nexius_os"."expert_expertise" OWNER TO "postgres";

--
-- Name: expert_role_map; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."expert_role_map" (
    "expert_id" "text" NOT NULL,
    "role_id" "text" NOT NULL
);


ALTER TABLE "nexius_os"."expert_role_map" OWNER TO "postgres";

--
-- Name: experts; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."experts" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "location" "text",
    "image_url" "text",
    "about" "text",
    "headline" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."experts" OWNER TO "postgres";

--
-- Name: interview_messages; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."interview_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "text" "text" NOT NULL,
    "timestamp_ms" bigint,
    "seq" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "interview_messages_role_check" CHECK (("role" = ANY (ARRAY['system'::"text", 'user'::"text", 'assistant'::"text"])))
);


ALTER TABLE "nexius_os"."interview_messages" OWNER TO "postgres";

--
-- Name: interview_sessions; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."interview_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visitor_id" "text",
    "role_id" "text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "last_active_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "text"
);


ALTER TABLE "nexius_os"."interview_sessions" OWNER TO "postgres";

--
-- Name: lead_events; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."lead_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."lead_events" OWNER TO "postgres";

--
-- Name: leads; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "company" "text",
    "email" "text" NOT NULL,
    "phone" "text",
    "company_size" "text",
    "interest" "text",
    "message" "text",
    "source_page" "text",
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "referrer" "text",
    "status" "text" DEFAULT 'new'::"text",
    "owner" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."leads" OWNER TO "postgres";

--
-- Name: payment_onboarding; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."payment_onboarding" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "telegram_username" "text" NOT NULL,
    "telegram_bot_token" "text" NOT NULL,
    "role_ids" "text"[] DEFAULT '{}'::"text"[],
    "currency" "text" DEFAULT 'SGD'::"text",
    "monthly_total" numeric,
    "source_page" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."payment_onboarding" OWNER TO "postgres";

--
-- Name: role_function_skills; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."role_function_skills" (
    "role_function_id" "uuid" NOT NULL,
    "skill_id" "uuid" NOT NULL,
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "nexius_os"."role_function_skills" OWNER TO "postgres";

--
-- Name: role_functions; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."role_functions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "automation_percent" integer NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "role_functions_automation_percent_check" CHECK ((("automation_percent" >= 0) AND ("automation_percent" <= 100)))
);


ALTER TABLE "nexius_os"."role_functions" OWNER TO "postgres";

--
-- Name: role_outcomes; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."role_outcomes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "text" NOT NULL,
    "value" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."role_outcomes" OWNER TO "postgres";

--
-- Name: role_system_map; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."role_system_map" (
    "role_id" "text" NOT NULL,
    "system_id" "uuid" NOT NULL
);


ALTER TABLE "nexius_os"."role_system_map" OWNER TO "postgres";

--
-- Name: role_tag_map; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."role_tag_map" (
    "role_id" "text" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "nexius_os"."role_tag_map" OWNER TO "postgres";

--
-- Name: roles; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."roles" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "detailed_description" "text",
    "workflow_code" "nexius_os"."workflow_t" NOT NULL,
    "kpi" "text",
    "governance" "nexius_os"."governance_t" NOT NULL,
    "complexity" "nexius_os"."complexity_t" NOT NULL,
    "time_to_value" "nexius_os"."time_to_value_t" NOT NULL,
    "outcome_category" "nexius_os"."outcome_category_t" NOT NULL,
    "image_url" "text",
    "function_count" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."roles" OWNER TO "postgres";

--
-- Name: shortlist_items; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."shortlist_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "role_id" "text" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."shortlist_items" OWNER TO "postgres";

--
-- Name: shortlist_sessions; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."shortlist_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visitor_id" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "text"
);


ALTER TABLE "nexius_os"."shortlist_sessions" OWNER TO "postgres";

--
-- Name: skills; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."skills" OWNER TO "postgres";

--
-- Name: subscription_events; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."subscription_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "provider_event_id" "text",
    "event_type" "text",
    "payload" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."subscription_events" OWNER TO "postgres";

--
-- Name: subscriptions; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_ids" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "currency" "text" DEFAULT 'SGD'::"text" NOT NULL,
    "monthly_amount" integer DEFAULT 0 NOT NULL,
    "status" "nexius_os"."subscription_status_t" DEFAULT 'initiated'::"nexius_os"."subscription_status_t" NOT NULL,
    "billing_starts_at" timestamp with time zone,
    "provider" "text" DEFAULT 'airwallex'::"text",
    "provider_customer_id" "text",
    "provider_subscription_id" "text",
    "provider_checkout_id" "text",
    "provider_price_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."subscriptions" OWNER TO "postgres";

--
-- Name: systems; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."systems" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."systems" OWNER TO "postgres";

--
-- Name: tags; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" DEFAULT 'general'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."tags" OWNER TO "postgres";

--
-- Name: visitor_events; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."visitor_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visitor_id" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "role_id" "text",
    "payload" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."visitor_events" OWNER TO "postgres";

--
-- Name: workflows; Type: TABLE; Schema: nexius_os; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "nexius_os"."workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "nexius_os"."workflow_t" NOT NULL,
    "name" "text" NOT NULL,
    "banner_image" "text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "nexius_os"."workflows" OWNER TO "postgres";

--
-- Name: expert_certifications expert_certifications_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_certifications"
    ADD CONSTRAINT "expert_certifications_pkey" PRIMARY KEY ("id");


--
-- Name: expert_education expert_education_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_education"
    ADD CONSTRAINT "expert_education_pkey" PRIMARY KEY ("id");


--
-- Name: expert_experience expert_experience_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_experience"
    ADD CONSTRAINT "expert_experience_pkey" PRIMARY KEY ("id");


--
-- Name: expert_expertise expert_expertise_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_expertise"
    ADD CONSTRAINT "expert_expertise_pkey" PRIMARY KEY ("id");


--
-- Name: expert_role_map expert_role_map_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_role_map"
    ADD CONSTRAINT "expert_role_map_pkey" PRIMARY KEY ("expert_id", "role_id");


--
-- Name: experts experts_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."experts"
    ADD CONSTRAINT "experts_pkey" PRIMARY KEY ("id");


--
-- Name: interview_messages interview_messages_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."interview_messages"
    ADD CONSTRAINT "interview_messages_pkey" PRIMARY KEY ("id");


--
-- Name: interview_sessions interview_sessions_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."interview_sessions"
    ADD CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id");


--
-- Name: lead_events lead_events_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."lead_events"
    ADD CONSTRAINT "lead_events_pkey" PRIMARY KEY ("id");


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");


--
-- Name: payment_onboarding payment_onboarding_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."payment_onboarding"
    ADD CONSTRAINT "payment_onboarding_pkey" PRIMARY KEY ("id");


--
-- Name: role_function_skills role_function_skills_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_function_skills"
    ADD CONSTRAINT "role_function_skills_pkey" PRIMARY KEY ("role_function_id", "skill_id");


--
-- Name: role_functions role_functions_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_functions"
    ADD CONSTRAINT "role_functions_pkey" PRIMARY KEY ("id");


--
-- Name: role_outcomes role_outcomes_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_outcomes"
    ADD CONSTRAINT "role_outcomes_pkey" PRIMARY KEY ("id");


--
-- Name: role_system_map role_system_map_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_system_map"
    ADD CONSTRAINT "role_system_map_pkey" PRIMARY KEY ("role_id", "system_id");


--
-- Name: role_tag_map role_tag_map_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_tag_map"
    ADD CONSTRAINT "role_tag_map_pkey" PRIMARY KEY ("role_id", "tag_id");


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");


--
-- Name: shortlist_items shortlist_items_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."shortlist_items"
    ADD CONSTRAINT "shortlist_items_pkey" PRIMARY KEY ("id");


--
-- Name: shortlist_items shortlist_items_session_id_role_id_key; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."shortlist_items"
    ADD CONSTRAINT "shortlist_items_session_id_role_id_key" UNIQUE ("session_id", "role_id");


--
-- Name: shortlist_sessions shortlist_sessions_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."shortlist_sessions"
    ADD CONSTRAINT "shortlist_sessions_pkey" PRIMARY KEY ("id");


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."skills"
    ADD CONSTRAINT "skills_name_key" UNIQUE ("name");


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."skills"
    ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("id");


--
-- Name: subscription_events subscription_events_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."subscription_events"
    ADD CONSTRAINT "subscription_events_pkey" PRIMARY KEY ("id");


--
-- Name: subscription_events subscription_events_provider_event_id_key; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."subscription_events"
    ADD CONSTRAINT "subscription_events_provider_event_id_key" UNIQUE ("provider_event_id");


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");


--
-- Name: systems systems_code_key; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."systems"
    ADD CONSTRAINT "systems_code_key" UNIQUE ("code");


--
-- Name: systems systems_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."systems"
    ADD CONSTRAINT "systems_pkey" PRIMARY KEY ("id");


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");


--
-- Name: visitor_events visitor_events_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."visitor_events"
    ADD CONSTRAINT "visitor_events_pkey" PRIMARY KEY ("id");


--
-- Name: workflows workflows_code_key; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."workflows"
    ADD CONSTRAINT "workflows_code_key" UNIQUE ("code");


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."workflows"
    ADD CONSTRAINT "workflows_pkey" PRIMARY KEY ("id");


--
-- Name: idx_interview_sessions_role; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_interview_sessions_role" ON "nexius_os"."interview_sessions" USING "btree" ("role_id");


--
-- Name: idx_interview_sessions_user; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_interview_sessions_user" ON "nexius_os"."interview_sessions" USING "btree" ("user_id");


--
-- Name: idx_leads_created_at; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_leads_created_at" ON "nexius_os"."leads" USING "btree" ("created_at" DESC);


--
-- Name: idx_leads_email; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_leads_email" ON "nexius_os"."leads" USING "btree" ("email");


--
-- Name: idx_payment_onboarding_created_at; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_payment_onboarding_created_at" ON "nexius_os"."payment_onboarding" USING "btree" ("created_at" DESC);


--
-- Name: idx_role_functions_role; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_role_functions_role" ON "nexius_os"."role_functions" USING "btree" ("role_id");


--
-- Name: idx_role_outcomes_role; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_role_outcomes_role" ON "nexius_os"."role_outcomes" USING "btree" ("role_id");


--
-- Name: idx_roles_governance; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_roles_governance" ON "nexius_os"."roles" USING "btree" ("governance");


--
-- Name: idx_roles_ttv; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_roles_ttv" ON "nexius_os"."roles" USING "btree" ("time_to_value");


--
-- Name: idx_roles_workflow; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_roles_workflow" ON "nexius_os"."roles" USING "btree" ("workflow_code");


--
-- Name: idx_shortlist_sessions_user; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_shortlist_sessions_user" ON "nexius_os"."shortlist_sessions" USING "btree" ("user_id");


--
-- Name: idx_subscription_events_created_at; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_subscription_events_created_at" ON "nexius_os"."subscription_events" USING "btree" ("created_at" DESC);


--
-- Name: idx_subscription_events_sub; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_subscription_events_sub" ON "nexius_os"."subscription_events" USING "btree" ("subscription_id");


--
-- Name: idx_subscriptions_created_at; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_subscriptions_created_at" ON "nexius_os"."subscriptions" USING "btree" ("created_at" DESC);


--
-- Name: idx_subscriptions_status; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_subscriptions_status" ON "nexius_os"."subscriptions" USING "btree" ("status");


--
-- Name: idx_subscriptions_user; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_subscriptions_user" ON "nexius_os"."subscriptions" USING "btree" ("user_id");


--
-- Name: idx_visitor_events_created; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_visitor_events_created" ON "nexius_os"."visitor_events" USING "btree" ("created_at" DESC);


--
-- Name: idx_visitor_events_type; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_visitor_events_type" ON "nexius_os"."visitor_events" USING "btree" ("event_type");


--
-- Name: idx_visitor_events_visitor; Type: INDEX; Schema: nexius_os; Owner: postgres
--

CREATE INDEX "idx_visitor_events_visitor" ON "nexius_os"."visitor_events" USING "btree" ("visitor_id");


--
-- Name: expert_certifications expert_certifications_expert_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_certifications"
    ADD CONSTRAINT "expert_certifications_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "nexius_os"."experts"("id") ON DELETE CASCADE;


--
-- Name: expert_education expert_education_expert_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_education"
    ADD CONSTRAINT "expert_education_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "nexius_os"."experts"("id") ON DELETE CASCADE;


--
-- Name: expert_experience expert_experience_expert_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_experience"
    ADD CONSTRAINT "expert_experience_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "nexius_os"."experts"("id") ON DELETE CASCADE;


--
-- Name: expert_expertise expert_expertise_expert_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_expertise"
    ADD CONSTRAINT "expert_expertise_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "nexius_os"."experts"("id") ON DELETE CASCADE;


--
-- Name: expert_role_map expert_role_map_expert_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_role_map"
    ADD CONSTRAINT "expert_role_map_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "nexius_os"."experts"("id") ON DELETE CASCADE;


--
-- Name: expert_role_map expert_role_map_role_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."expert_role_map"
    ADD CONSTRAINT "expert_role_map_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "nexius_os"."roles"("id") ON DELETE CASCADE;


--
-- Name: interview_messages interview_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."interview_messages"
    ADD CONSTRAINT "interview_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "nexius_os"."interview_sessions"("id") ON DELETE CASCADE;


--
-- Name: interview_sessions interview_sessions_role_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."interview_sessions"
    ADD CONSTRAINT "interview_sessions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "nexius_os"."roles"("id") ON DELETE CASCADE;


--
-- Name: lead_events lead_events_lead_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."lead_events"
    ADD CONSTRAINT "lead_events_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "nexius_os"."leads"("id") ON DELETE CASCADE;


--
-- Name: role_function_skills role_function_skills_role_function_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_function_skills"
    ADD CONSTRAINT "role_function_skills_role_function_id_fkey" FOREIGN KEY ("role_function_id") REFERENCES "nexius_os"."role_functions"("id") ON DELETE CASCADE;


--
-- Name: role_function_skills role_function_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_function_skills"
    ADD CONSTRAINT "role_function_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "nexius_os"."skills"("id") ON DELETE CASCADE;


--
-- Name: role_functions role_functions_role_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_functions"
    ADD CONSTRAINT "role_functions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "nexius_os"."roles"("id") ON DELETE CASCADE;


--
-- Name: role_outcomes role_outcomes_role_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_outcomes"
    ADD CONSTRAINT "role_outcomes_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "nexius_os"."roles"("id") ON DELETE CASCADE;


--
-- Name: role_system_map role_system_map_role_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_system_map"
    ADD CONSTRAINT "role_system_map_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "nexius_os"."roles"("id") ON DELETE CASCADE;


--
-- Name: role_system_map role_system_map_system_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_system_map"
    ADD CONSTRAINT "role_system_map_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "nexius_os"."systems"("id") ON DELETE CASCADE;


--
-- Name: role_tag_map role_tag_map_role_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_tag_map"
    ADD CONSTRAINT "role_tag_map_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "nexius_os"."roles"("id") ON DELETE CASCADE;


--
-- Name: role_tag_map role_tag_map_tag_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."role_tag_map"
    ADD CONSTRAINT "role_tag_map_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "nexius_os"."tags"("id") ON DELETE CASCADE;


--
-- Name: shortlist_items shortlist_items_role_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."shortlist_items"
    ADD CONSTRAINT "shortlist_items_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "nexius_os"."roles"("id") ON DELETE CASCADE;


--
-- Name: shortlist_items shortlist_items_session_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."shortlist_items"
    ADD CONSTRAINT "shortlist_items_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "nexius_os"."shortlist_sessions"("id") ON DELETE CASCADE;


--
-- Name: subscription_events subscription_events_subscription_id_fkey; Type: FK CONSTRAINT; Schema: nexius_os; Owner: postgres
--

ALTER TABLE ONLY "nexius_os"."subscription_events"
    ADD CONSTRAINT "subscription_events_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "nexius_os"."subscriptions"("id") ON DELETE CASCADE;


--
-- Name: SCHEMA "nexius_os"; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA "nexius_os" TO "anon";
GRANT USAGE ON SCHEMA "nexius_os" TO "authenticated";
GRANT USAGE ON SCHEMA "nexius_os" TO "service_role";


--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: TABLE "expert_certifications"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."expert_certifications" TO "anon";
GRANT ALL ON TABLE "nexius_os"."expert_certifications" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."expert_certifications" TO "service_role";


--
-- Name: TABLE "expert_education"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."expert_education" TO "anon";
GRANT ALL ON TABLE "nexius_os"."expert_education" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."expert_education" TO "service_role";


--
-- Name: TABLE "expert_experience"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."expert_experience" TO "anon";
GRANT ALL ON TABLE "nexius_os"."expert_experience" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."expert_experience" TO "service_role";


--
-- Name: TABLE "expert_expertise"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."expert_expertise" TO "anon";
GRANT ALL ON TABLE "nexius_os"."expert_expertise" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."expert_expertise" TO "service_role";


--
-- Name: TABLE "expert_role_map"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."expert_role_map" TO "anon";
GRANT ALL ON TABLE "nexius_os"."expert_role_map" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."expert_role_map" TO "service_role";


--
-- Name: TABLE "experts"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."experts" TO "anon";
GRANT ALL ON TABLE "nexius_os"."experts" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."experts" TO "service_role";


--
-- Name: TABLE "interview_messages"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."interview_messages" TO "anon";
GRANT ALL ON TABLE "nexius_os"."interview_messages" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."interview_messages" TO "service_role";


--
-- Name: TABLE "interview_sessions"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."interview_sessions" TO "anon";
GRANT ALL ON TABLE "nexius_os"."interview_sessions" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."interview_sessions" TO "service_role";


--
-- Name: TABLE "lead_events"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."lead_events" TO "anon";
GRANT ALL ON TABLE "nexius_os"."lead_events" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."lead_events" TO "service_role";


--
-- Name: TABLE "leads"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."leads" TO "anon";
GRANT ALL ON TABLE "nexius_os"."leads" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."leads" TO "service_role";


--
-- Name: TABLE "payment_onboarding"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."payment_onboarding" TO "anon";
GRANT ALL ON TABLE "nexius_os"."payment_onboarding" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."payment_onboarding" TO "service_role";


--
-- Name: TABLE "role_function_skills"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."role_function_skills" TO "anon";
GRANT ALL ON TABLE "nexius_os"."role_function_skills" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."role_function_skills" TO "service_role";


--
-- Name: TABLE "role_functions"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."role_functions" TO "anon";
GRANT ALL ON TABLE "nexius_os"."role_functions" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."role_functions" TO "service_role";


--
-- Name: TABLE "role_outcomes"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."role_outcomes" TO "anon";
GRANT ALL ON TABLE "nexius_os"."role_outcomes" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."role_outcomes" TO "service_role";


--
-- Name: TABLE "role_system_map"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."role_system_map" TO "anon";
GRANT ALL ON TABLE "nexius_os"."role_system_map" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."role_system_map" TO "service_role";


--
-- Name: TABLE "role_tag_map"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."role_tag_map" TO "anon";
GRANT ALL ON TABLE "nexius_os"."role_tag_map" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."role_tag_map" TO "service_role";


--
-- Name: TABLE "roles"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."roles" TO "anon";
GRANT ALL ON TABLE "nexius_os"."roles" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."roles" TO "service_role";


--
-- Name: TABLE "shortlist_items"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."shortlist_items" TO "anon";
GRANT ALL ON TABLE "nexius_os"."shortlist_items" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."shortlist_items" TO "service_role";


--
-- Name: TABLE "shortlist_sessions"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."shortlist_sessions" TO "anon";
GRANT ALL ON TABLE "nexius_os"."shortlist_sessions" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."shortlist_sessions" TO "service_role";


--
-- Name: TABLE "skills"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."skills" TO "anon";
GRANT ALL ON TABLE "nexius_os"."skills" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."skills" TO "service_role";


--
-- Name: TABLE "subscription_events"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."subscription_events" TO "anon";
GRANT ALL ON TABLE "nexius_os"."subscription_events" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."subscription_events" TO "service_role";


--
-- Name: TABLE "subscriptions"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."subscriptions" TO "anon";
GRANT ALL ON TABLE "nexius_os"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."subscriptions" TO "service_role";


--
-- Name: TABLE "systems"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."systems" TO "anon";
GRANT ALL ON TABLE "nexius_os"."systems" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."systems" TO "service_role";


--
-- Name: TABLE "tags"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."tags" TO "anon";
GRANT ALL ON TABLE "nexius_os"."tags" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."tags" TO "service_role";


--
-- Name: TABLE "visitor_events"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."visitor_events" TO "anon";
GRANT ALL ON TABLE "nexius_os"."visitor_events" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."visitor_events" TO "service_role";


--
-- Name: TABLE "workflows"; Type: ACL; Schema: nexius_os; Owner: postgres
--

GRANT ALL ON TABLE "nexius_os"."workflows" TO "anon";
GRANT ALL ON TABLE "nexius_os"."workflows" TO "authenticated";
GRANT ALL ON TABLE "nexius_os"."workflows" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: nexius_os; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "nexius_os" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "nexius_os" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "nexius_os" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: nexius_os; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "nexius_os" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "nexius_os" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "nexius_os" GRANT ALL ON TABLES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- PostgreSQL database dump complete
--

-- \unrestrict phWEusKlO0BK3pakeyLnVbfdb7CCxD5Yr7ygkuenFThV5NqTOOvnge96kltTjk6

