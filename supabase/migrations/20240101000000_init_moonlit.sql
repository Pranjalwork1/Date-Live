-- ==============================================================================
-- Moonlit — Watch Together Database Schema
-- Migration: 20240101000000_init_moonlit.sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (Optional persistent profile for registered or guest users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Date Rooms Table
CREATE TABLE IF NOT EXISTS public.date_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Our Movie Night',
    host_user_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'midnight',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for quick room lookups
CREATE INDEX IF NOT EXISTS idx_date_rooms_code ON public.date_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_date_rooms_expires ON public.date_rooms(expires_at);

-- 3. Room Members Table
CREATE TABLE IF NOT EXISTS public.room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.date_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('host', 'guest', 'viewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);

-- 4. Room Messages Table (Persistent Chat)
CREATE TABLE IF NOT EXISTS public.room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.date_rooms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_messages_room_created ON public.room_messages(room_id, created_at ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles can be read"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Anyone can upsert their profile"
    ON public.profiles FOR ALL
    USING (true)
    WITH CHECK (true);

-- Date Rooms policies
CREATE POLICY "Rooms can be viewed if not expired"
    ON public.date_rooms FOR SELECT
    USING (expires_at > NOW());

CREATE POLICY "Anyone can create a room"
    ON public.date_rooms FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Host can update their room"
    ON public.date_rooms FOR UPDATE
    USING (true);

-- Room Members policies
CREATE POLICY "Members can be viewed by anyone in the room"
    ON public.room_members FOR SELECT
    USING (true);

CREATE POLICY "Users can join rooms"
    ON public.room_members FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Members can update their own presence"
    ON public.room_members FOR UPDATE
    USING (true);

-- Room Messages policies
CREATE POLICY "Anyone in the room can read messages"
    ON public.room_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.date_rooms
            WHERE date_rooms.id = room_messages.room_id
              AND date_rooms.expires_at > NOW()
        )
    );

CREATE POLICY "Authorized members can send messages"
    ON public.room_messages FOR INSERT
    WITH CHECK (
        char_length(content) > 0 AND char_length(content) <= 2000
    );

-- Enable Supabase Realtime for messages if replica identity allows
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
