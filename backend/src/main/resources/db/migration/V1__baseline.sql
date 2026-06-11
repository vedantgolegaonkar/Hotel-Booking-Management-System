-- V1 Baseline Migration
-- This script acts as the foundational baseline for Flyway.
-- Since the database was previously managed by Hibernate's 'ddl-auto: update', 
-- Flyway will automatically mark this version as executed on existing databases 
-- without attempting to recreate the tables (due to baseline-on-migrate: true).

-- For entirely fresh local setups, developers should temporarily set:
-- spring.jpa.hibernate.ddl-auto: create
-- to allow Hibernate to construct the initial schema, and then revert to 'validate'.

-- All future schema modifications must be placed in V2__xxx.sql, V3__xxx.sql scripts.
