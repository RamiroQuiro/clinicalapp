import Button from '@/components/atomos/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import { ArrowRight, type IconNode } from 'lucide-react';

type SettingsCategory = {
    id: string;
    name: string;
    description: string;
    icon: IconNode;
};

type Props = {
    category: SettingsCategory;
};

export default function CardAjustes({ category }: Props) {
    const Icono = category?.icon;

    return (
        <Card className="border-primary-border shadow-card flex flex-col h-full justify-between">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icono className="h-5 w-5 text-primary-300" />
                    <span className='text-lg font-bold'>{category?.name}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {category?.description}
                </p>
                <a href={`/dashboard/ajustes/${category?.id}`}>
                    <Button variant="indigo" className="mt-4 w-full gap-2">
                        Configurar
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </a>
            </CardContent>
        </Card>
    );
}
