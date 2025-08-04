-- Security Fix: Replace overly permissive RLS policies with proper read-only access
-- This maintains public read access for the instruction engine while removing write permissions

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow read access to all" ON public.authors;
DROP POLICY IF EXISTS "Allow read access to all" ON public.categories;
DROP POLICY IF EXISTS "Allow read access to all" ON public.instructions;
DROP POLICY IF EXISTS "Allow read access to all" ON public.instruction_categories;
DROP POLICY IF EXISTS "Allow read access to all" ON public.instruction_tags;
DROP POLICY IF EXISTS "Allow read access to all" ON public.tags;

-- Create proper read-only policies for public access
-- Authors table - public read access only
CREATE POLICY "Public read access to authors"
ON public.authors
FOR SELECT
TO public
USING (true);

-- Categories table - public read access only  
CREATE POLICY "Public read access to categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- Instructions table - public read access only
CREATE POLICY "Public read access to instructions"
ON public.instructions
FOR SELECT
TO public
USING (true);

-- Instruction categories junction table - public read access only
CREATE POLICY "Public read access to instruction_categories"
ON public.instruction_categories
FOR SELECT
TO public
USING (true);

-- Instruction tags junction table - public read access only
CREATE POLICY "Public read access to instruction_tags"
ON public.instruction_tags
FOR SELECT
TO public
USING (true);

-- Tags table - public read access only
CREATE POLICY "Public read access to tags"
ON public.tags
FOR SELECT
TO public
USING (true);

-- Ensure all tables still have RLS enabled
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instruction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instruction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;