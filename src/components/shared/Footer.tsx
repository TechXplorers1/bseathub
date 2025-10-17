import Link from 'next/link';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Footer() {
  const footerSections = [
    {
      title: 'Top Cities',
      links: ['New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
    },
    {
      title: 'Get to Know Us',
      links: ['About Us', 'Careers', 'Investors', 'Company Blog', 'Engineering Blog'],
    },
    {
      title: 'Let Us Help You',
      links: ['Account Details', 'Order History', 'Help', 'Accessibility'],
    },
    {
      title: 'Doing Business',
      links: ['Become a Dasher', 'Be a Partner Restaurant', 'Get Dashers for Deliveries', 'Get SwiftDash for Work'],
    },
  ];

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
            <div className="flex items-center space-x-4">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <Select defaultValue="en">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <p className="mt-4 text-sm text-muted-foreground sm:mt-0">
                &copy; {new Date().getFullYear()} SwiftDash
            </p>
        </div>
      </div>
    </footer>
  );
}
