import { Badge } from "@/components/ui/badge"
import { Briefcase, Building, MapPin, GraduationCap, Calendar, Globe, LinkIcon } from "lucide-react"

interface ProfileInfoProps {
  user: {
    name: string
    title: string
    company: string
    location: string
    about: string
    experience: Array<{
      id: string
      title: string
      company: string
      startDate: string
      endDate: string | null
      description: string
    }>
    education: Array<{
      id: string
      school: string
      degree: string
      field: string
      startYear: string
      endYear: string | null
    }>
    skills: string[]
    website: string | null
    socialLinks: Array<{
      platform: string
      url: string
    }>
  }
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <div className="pt-16 px-4 sm:px-8">
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-lg text-muted-foreground">{user.title}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
            {user.company && (
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{user.company}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}
          </div>

          {/* Website and Social Links */}
          {(user.website || user.socialLinks.length > 0) && (
            <div className="flex flex-wrap gap-3 mt-3">
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </a>
              )}

              {user.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>{link.platform}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* About */}
        {user.about && (
          <div>
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-sm whitespace-pre-line">{user.about}</p>
          </div>
        )}

        {/* Experience */}
        {user.experience.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Experience</h2>
            <div className="space-y-4">
              {user.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-muted pl-4 pb-2">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mr-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {exp.startDate} - {exp.endDate || "Present"}
                      </p>
                      {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {user.education.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Education</h2>
            <div className="space-y-4">
              {user.education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-muted pl-4 pb-2">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mr-3">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{edu.school}</h3>
                      <p className="text-sm text-muted-foreground">
                        {edu.degree}, {edu.field}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {edu.startYear} - {edu.endYear || "Present"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {user.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

