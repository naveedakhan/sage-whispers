-- Create function to get random instructions
CREATE OR REPLACE FUNCTION public.get_random_instructions(result_limit integer DEFAULT 20)
RETURNS TABLE(instruction_id integer, text text, source_id integer, tags text[], categories text[])
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
    -- Cap at 50 results max
    IF result_limit > 50 THEN
        result_limit := 50;
    END IF;
    
    -- Log random fetch event
    PERFORM public.log_security_event('random_fetch', NULL, NULL, 
        jsonb_build_object('limit', result_limit)
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
    GROUP BY i.id, i.text, i.source_id
    ORDER BY RANDOM()
    LIMIT result_limit;
END;
$function$;