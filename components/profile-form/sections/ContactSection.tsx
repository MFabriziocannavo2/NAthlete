import { Input } from "@/components/ui/Input"
import type { SectionProps } from "../types"

export default function ContactSection({ form, onChange }: SectionProps) {
  return (
    <>
      <Input
        name="agent_contact"
        placeholder="Agent / Contact Email"
        value={form.agent_contact}
        onChange={onChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          name="instagram_url"
          placeholder="Instagram URL"
          value={form.instagram_url}
          onChange={onChange}
        />

        <Input
          name="twitter_url"
          placeholder="X / Twitter URL"
          value={form.twitter_url}
          onChange={onChange}
        />

        <Input
          name="linkedin_url"
          placeholder="LinkedIn URL"
          value={form.linkedin_url}
          onChange={onChange}
        />
      </div>
    </>
  )
}
