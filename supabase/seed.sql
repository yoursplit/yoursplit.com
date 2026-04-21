-- 1. Create the test user in Supabase's internal auth table
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'user@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name": "User", "avatar_url": ""}',
    now(),
    now()
);

-- 2. Update the auto-generated profile
UPDATE public.profiles
SET username = 'user'
WHERE id = '00000000-0000-0000-0000-000000000000';

-- 3. Insert the Workout Routine (Auto-assigned ID: 1)
INSERT INTO public.workout_routines (
    user_id,
    name,
    description,
    slug,
    uses_numbered_days,
    workout_type,
    workout_difficulty
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Arnold Split',
    'Based on the arnold split',
    'arnold-split',
    false,
    'strength',
    'intermediate'
);

-- 4. Insert the Workout Days 
-- Because we omit the ID, Postgres auto-assigns 1 through 7 in this exact order.
INSERT INTO public.workout_days (workout_routine_id, day_number, day_focus)
VALUES 
    (1, 1, 'Chest + Back'),     -- Becomes Day ID 1
    (1, 2, 'Shoulders + Arms'), -- Becomes Day ID 2
    (1, 3, 'Legs'),             -- Becomes Day ID 3
    (1, 4, 'Chest + Back'),     -- Becomes Day ID 4
    (1, 5, 'Rest'),             -- Becomes Day ID 5
    (1, 6, 'Shoulders + Arms'), -- Becomes Day ID 6
    (1, 7, 'Legs');             -- Becomes Day ID 7

-- 5. Insert the Workout Exercises
-- Mapped perfectly to the auto-generated Day IDs above.
INSERT INTO public.workout_exercises (workout_day_id, name, sets, reps)
VALUES 
    -- Day 1: Chest + Back 
    (1, 'Bench Press', 4, 8),
    (1, 'Rows', 4, 10),
    (1, 'Incline Bench Press', 4, 8),
    (1, 'Lat Pulldowns', 4, 8),
    (1, 'Front Raises', 4, 8),

    -- Day 2: Shoulders + Arms 
    (2, 'Shoulder Press', 4, 8),
    (2, 'Hammer Curls', 4, 8),
    (2, 'Tricep Pulldowns', 4, 8),
    (2, 'Preacher Curls', 4, 8),
    (2, 'Tricep Dips', 4, 10),

    -- Day 3: Legs 
    (3, 'Hack Squats', 4, 10),
    (3, 'Hamstring Curls', 4, 10),
    (3, 'Leg Extensions', 4, 10),
    (3, 'Bulgarian Split Squats', 4, 10),
    (3, 'Calf Raises', 4, 12),

    -- Day 4: Chest + Back 
    (4, 'Dumbbell Press', 4, 8),
    (4, 'Bent Over Rows', 4, 8),
    (4, 'Incline Dumbbell Press', 4, 8),
    (4, 'Pull Ups', 4, 8),
    (4, 'Chest Dips', 4, 10),

    -- Day 5: Rest 
    -- (No exercises)

    -- Day 6: Shoulders + Arms 
    (6, 'Arnold Press', 4, 8),
    (6, 'Concentration Curls', 4, 8),
    (6, 'Overhead Tricep Extensions', 4, 10),
    (6, 'Preacher Curls', 4, 8),
    (6, 'Lateral Raises', 4, 10),

    -- Day 7: Legs 
    (7, 'Leg Press', 4, 8),
    (7, 'Hamstring Curls', 4, 10),
    (7, 'Leg Extensions', 4, 10),
    (7, 'Calf Raises', 4, 12);
