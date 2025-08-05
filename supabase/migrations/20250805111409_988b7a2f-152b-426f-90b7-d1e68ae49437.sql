-- Fix search_instructions_secure function to allow logging
DROP FUNCTION IF EXISTS public.search_instructions_secure(text, text[], text[], integer);

CREATE OR REPLACE FUNCTION public.search_instructions_secure(
    search_term text DEFAULT ''::text, 
    tag_filters text[] DEFAULT '{}'::text[], 
    category_filters text[] DEFAULT '{}'::text[], 
    result_limit integer DEFAULT 50
)
RETURNS TABLE(instruction_id integer, text text, source_id integer, tags text[], categories text[])
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
AS $function$
BEGIN
    -- Validate inputs
    IF LENGTH(search_term) > 1000 THEN
        RAISE EXCEPTION 'Search term too long';
    END IF;
    
    IF result_limit > 100 THEN
        result_limit := 100; -- Cap at 100 results
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
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
        ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as categories
    FROM public.instructions i
    LEFT JOIN public.instruction_tags it ON i.id = it.instruction_id
    LEFT JOIN public.tags t ON it.tag_id = t.id
    LEFT JOIN public.instruction_categories ic ON i.id = ic.instruction_id
    LEFT JOIN public.categories c ON ic.category_id = c.id
    WHERE 
        (search_term = '' OR i.text ILIKE '%' || search_term || '%')
        AND (
            ARRAY_LENGTH(tag_filters, 1) IS NULL 
            OR t.name = ANY(tag_filters)
        )
        AND (
            ARRAY_LENGTH(category_filters, 1) IS NULL 
            OR c.name = ANY(category_filters)
        )
    GROUP BY i.id, i.text, i.source_id
    LIMIT result_limit;
END;
$function$;