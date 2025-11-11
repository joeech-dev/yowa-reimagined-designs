import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEME_IO_API_KEY = Deno.env.get("SYSTEME_IO_API_KEY");
const SYSTEME_IO_API_URL = "https://api.systeme.io/api";

interface ContactRequest {
  email: string;
  name?: string;
  phone?: string;
  fields?: Array<{
    slug: string;
    value: string;
  }>;
  tags?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, phone, fields = [], tags = [] }: ContactRequest = await req.json();

    console.log("Adding contact to systeme.io:", { email, name });

    // Build contact fields with only standard fields
    const contactFields = [];
    if (name) {
      contactFields.push({ slug: "first_name", value: name });
    }
    if (phone) {
      contactFields.push({ slug: "phone_number", value: phone });
    }

    // Create contact in systeme.io
    const contactResponse = await fetch(`${SYSTEME_IO_API_URL}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": SYSTEME_IO_API_KEY!,
      },
      body: JSON.stringify({
        email,
        fields: contactFields,
      }),
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error("Systeme.io contact creation error:", errorText);
      throw new Error(`Failed to create contact: ${contactResponse.status} ${errorText}`);
    }

    const contactData = await contactResponse.json();
    console.log("Contact created successfully:", contactData);

    // Add tags if provided
    if (tags.length > 0) {
      for (const tagName of tags) {
        try {
          // First, try to create the tag (will return existing if already exists)
          const tagResponse = await fetch(`${SYSTEME_IO_API_URL}/tags`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": SYSTEME_IO_API_KEY!,
            },
            body: JSON.stringify({ name: tagName }),
          });

          let tagData;
          if (tagResponse.ok) {
            tagData = await tagResponse.json();
          } else {
            // Tag might already exist, try to find it
            const tagsListResponse = await fetch(`${SYSTEME_IO_API_URL}/tags`, {
              headers: {
                "X-API-Key": SYSTEME_IO_API_KEY!,
              },
            });
            const tagsList = await tagsListResponse.json();
            tagData = tagsList.items?.find((t: any) => t.name === tagName);
          }

          if (tagData?.id) {
            // Assign tag to contact
            await fetch(`${SYSTEME_IO_API_URL}/tags/${tagData.id}/contacts/${contactData.id}`, {
              method: "PUT",
              headers: {
                "X-API-Key": SYSTEME_IO_API_KEY!,
              },
            });
            console.log(`Tag "${tagName}" assigned to contact`);
          }
        } catch (tagError) {
          console.error(`Error assigning tag "${tagName}":`, tagError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      contactId: contactData.id,
      message: "Contact added to systeme.io successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in systeme-add-contact function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to add contact to systeme.io",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
