import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Chef {
    name: string;
    specialty: string;
    avatarUrl: string;
    slug: string;
}

interface ChefCardProps {
  chef: Chef;
}

export function ChefCard({ chef }: ChefCardProps) {
  return (
    <Link href={`/restaurant/${chef.slug}?chef=${encodeURIComponent(chef.name)}`} className="flex">
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full">
        <CardHeader className="flex flex-row items-center gap-4 p-4">
            <Avatar className="h-16 w-16 border">
            <AvatarImage src={chef.avatarUrl} alt={chef.name} />
            <AvatarFallback>{chef.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
            <CardTitle>{chef.name}</CardTitle>
            <CardDescription>{chef.specialty}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground">The heart and soul behind the kitchen, bringing authentic flavors to your table.</p>
        </CardContent>
        </Card>
    </Link>
  );
}
