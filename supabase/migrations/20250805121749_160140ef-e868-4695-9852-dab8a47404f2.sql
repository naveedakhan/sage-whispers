-- Update the search_instructions_secure function to search across multiple fields
-- and implement proper tag AND logic and category OR logic
CREATE OR REPLACE FUNCTION public.search_instructions_secure(
    search_term text DEFAULT ''::text, 
    tag_filters text[] DEFAULT '{}'::text[], 
    category_filters text[] DEFAULT '{}'::text[], 
    result_limit integer DEFAULT 50,
    result_offset integer DEFAULT 0
)
RETURNS TABLE(
    instruction_id integer,
    text text,
    source_id integer,
    author_name text,
    tags text[],
    categories text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Validate inputs
    IF LENGTH(search_term) > 1000 THEN
        RAISE EXCEPTION 'Search term too long';
    END IF;
    
    IF result_limit > 100 THEN
        result_limit := 100; -- Cap at 100 results
    END IF;

    IF result_offset < 0 THEN
        result_offset := 0;
    END IF;
    
    -- Log search event (basic monitoring)
    PERFORM public.log_security_event('search', NULL, NULL, 
        jsonb_build_object('term', search_term, 'tags', tag_filters, 'categories', category_filters)
    );
    
    RETURN QUERY
    SELECT 
        i.id as instruction_id,
        i.text,
        i.source_id,
        a.name as author_name,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
        ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as categories
    FROM public.instructions i
    LEFT JOIN public.authors a ON i.author_id = a.id
    LEFT JOIN public.instruction_tags it ON i.id = it.instruction_id
    LEFT JOIN public.tags t ON it.tag_id = t.id
    LEFT JOIN public.instruction_categories ic ON i.id = ic.instruction_id
    LEFT JOIN public.categories c ON ic.category_id = c.id
    WHERE 
        -- Search across instructions.text, authors.name, tags.name, and categories.name
        (
            search_term = '' OR 
            i.text ILIKE '%' || search_term || '%' OR
            a.name ILIKE '%' || search_term || '%' OR
            t.name ILIKE '%' || search_term || '%' OR
            c.name ILIKE '%' || search_term || '%'
        )
        -- Tag filters: AND logic (must have ALL selected tags)
        AND (
            ARRAY_LENGTH(tag_filters, 1) IS NULL OR
            i.id IN (
                SELECT it_inner.instruction_id 
                FROM public.instruction_tags it_inner
                JOIN public.tags t_inner ON it_inner.tag_id = t_inner.id
                WHERE t_inner.name = ANY(tag_filters)
                GROUP BY it_inner.instruction_id
                HAVING COUNT(DISTINCT t_inner.name) = ARRAY_LENGTH(tag_filters, 1)
            )
        )
        -- Category filters: OR logic (match ANY selected categories)
        AND (
            ARRAY_LENGTH(category_filters, 1) IS NULL OR
            i.id IN (
                SELECT ic_inner.instruction_id 
                FROM public.instruction_categories ic_inner
                JOIN public.categories c_inner ON ic_inner.category_id = c_inner.id
                WHERE c_inner.name = ANY(category_filters)
            )
        )
    GROUP BY i.id, i.text, i.source_id, a.name
    LIMIT result_limit OFFSET result_offset;
END;
$function$
