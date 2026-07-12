-- Expand the reserved-username list so usernames cannot shadow (or be shadowed
-- by) top-level routes and reserved system paths.
--
-- Keep this array in sync with RESERVED_USERNAMES in src/lib/constants.ts.
--
-- Note: ADD CONSTRAINT re-validates existing rows, so this migration fails if a
-- current profile already holds a newly-reserved name. Run the pre-flight check
-- and rename any conflicts first:
--   select id, username from public.profiles
--   where username = any(array[ /* same list */ ]::text[]);

ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_username_check";

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_username_check" CHECK (
  (char_length(username) >= 3)
  AND (username <> ALL (ARRAY[
    'account','api','auth','browse','login','new','privacy','terms',
    'signup','signin','signout','logout','register','callback','oauth','sso','verify','reset','password',
    'admin','settings','config','dashboard','dev','internal','system','root',
    'static','assets','public','www','cdn','media','files','images','img','favicon','robots','sitemap',
    'about','help','support','contact','faq','pricing','blog','docs','status','home','index','explore','search','feed','discover',
    'me','user','users','profile','profiles',
    'legal','cookies','security'
  ]::text[]))
);
