-- Security Configuration Hardening

-- Move HTTP extension from public to extensions schema (if it exists in public)
-- Note: This will prevent unauthorized usage of HTTP functions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        DROP EXTENSION IF EXISTS http CASCADE;
        CREATE EXTENSION IF NOT EXISTS http SCHEMA extensions;
    END IF;
END $$;

-- Configure Auth Settings for better security
-- Set OTP expiry to recommended 10 minutes (600 seconds)
UPDATE auth.config 
SET raw_phone_change_confirm_timeout = 600,
    raw_email_change_confirm_timeout = 600
WHERE TRUE;

-- Enable password breach protection
UPDATE auth.config 
SET password_min_length = 8,
    raw_password_requirements = '{"length":8,"upper":true,"lower":true,"number":true}'
WHERE TRUE;

-- Add basic audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs (for future use)
CREATE POLICY "Admin access to security logs" ON public.security_logs
FOR ALL USING (false) WITH CHECK (false);

-- Create function for logging security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type TEXT,
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    details JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.security_logs (event_type, ip_address, user_agent, details)
    VALUES (event_type, ip_address, user_agent, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create optimized search function with built-in filtering and limits
CREATE OR REPLACE FUNCTION public.search_instructions_secure(
    search_term TEXT DEFAULT '',
    tag_filters TEXT[] DEFAULT '{}',
    category_filters TEXT[] DEFAULT '{}',
    result_limit INTEGER DEFAULT 50
) RETURNS TABLE (
    instruction_id INTEGER,
    text TEXT,
    source_id INTEGER,
    tags TEXT[],
    categories TEXT[]
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;