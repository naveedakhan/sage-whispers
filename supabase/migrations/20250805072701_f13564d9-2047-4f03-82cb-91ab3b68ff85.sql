-- Security Fix: Remove SECURITY DEFINER views and improve RLS policies

-- Drop existing SECURITY DEFINER views
DROP VIEW IF EXISTS public.category_usage_summary;
DROP VIEW IF EXISTS public.tag_usage_summary; 
DROP VIEW IF EXISTS public.instruction_full;

-- Recreate category_usage_summary as regular view
CREATE VIEW public.category_usage_summary AS
SELECT 
    c.name as category,
    COUNT(ic.instruction_id) as instruction_count
FROM public.categories c
LEFT JOIN public.instruction_categories ic ON c.id = ic.category_id
GROUP BY c.id, c.name
ORDER BY instruction_count DESC;

-- Recreate tag_usage_summary as regular view
CREATE VIEW public.tag_usage_summary AS
SELECT 
    t.name as tag,
    COUNT(it.instruction_id) as instruction_count
FROM public.tags t
LEFT JOIN public.instruction_tags it ON t.id = it.tag_id
GROUP BY t.id, t.name
ORDER BY instruction_count DESC;

-- Recreate instruction_full as regular view
CREATE VIEW public.instruction_full AS
SELECT 
    i.id as instruction_id,
    i.text,
    i.source_id,
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
    ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as categories
FROM public.instructions i
LEFT JOIN public.instruction_tags it ON i.id = it.instruction_id
LEFT JOIN public.tags t ON it.tag_id = t.id
LEFT JOIN public.instruction_categories ic ON i.id = ic.instruction_id
LEFT JOIN public.categories c ON ic.category_id = c.id
GROUP BY i.id, i.text, i.source_id;

-- Add explicit write protection policies (keeping permissive read access for public content)
-- Authors table - prevent unauthorized writes
DROP POLICY IF EXISTS "Prevent unauthorized writes on authors" ON public.authors;
CREATE POLICY "Prevent unauthorized writes on authors" ON public.authors
FOR ALL USING (false) WITH CHECK (false);

-- Categories table - prevent unauthorized writes  
DROP POLICY IF EXISTS "Prevent unauthorized writes on categories" ON public.categories;
CREATE POLICY "Prevent unauthorized writes on categories" ON public.categories
FOR ALL USING (false) WITH CHECK (false);

-- Instructions table - prevent unauthorized writes
DROP POLICY IF EXISTS "Prevent unauthorized writes on instructions" ON public.instructions;
CREATE POLICY "Prevent unauthorized writes on instructions" ON public.instructions
FOR ALL USING (false) WITH CHECK (false);

-- Tags table - prevent unauthorized writes
DROP POLICY IF EXISTS "Prevent unauthorized writes on tags" ON public.tags;
CREATE POLICY "Prevent unauthorized writes on tags" ON public.tags
FOR ALL USING (false) WITH CHECK (false);

-- Junction tables - prevent unauthorized writes
DROP POLICY IF EXISTS "Prevent unauthorized writes on instruction_categories" ON public.instruction_categories;
CREATE POLICY "Prevent unauthorized writes on instruction_categories" ON public.instruction_categories
FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Prevent unauthorized writes on instruction_tags" ON public.instruction_tags;
CREATE POLICY "Prevent unauthorized writes on instruction_tags" ON public.instruction_tags
FOR ALL USING (false) WITH CHECK (false);