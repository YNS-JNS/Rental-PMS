import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = 'text-muted-foreground'
}: StatCardProps) {
  
  /**
   * Formatage style Stripe/Shopify avec règles contextuelles
   * Principe : Précision proportionnelle à la magnitude
   */
  const formatValue = (val: string | number): { number: string; currency?: string } | string => {
    const strVal = String(val);
    
    // Détection de la devise
    const currencyMatch = strVal.match(/[€$]|MAD/);
    const currencySymbol = currencyMatch ? currencyMatch[0] : null;
    
    if (currencySymbol) {
      // Nettoyage et normalisation du format européen
      let numPart = strVal.replace(/[€$MAD\s]/g, '');
      
      // Détecte le format : si contient à la fois . et ,
      if (numPart.includes('.') && numPart.includes(',')) {
        // Format européen : 152.160,00 → 152160.00
        numPart = numPart.replace(/\./g, '').replace(',', '.');
      } else if (numPart.includes(',')) {
        // Format européen simple : 1.234,56 ou 152160,00 → 152160.00
        numPart = numPart.replace(/\./g, '').replace(',', '.');
      } else {
        // Format US/international : 152,160.00
        numPart = numPart.replace(/,/g, '');
      }
      
      const num = parseFloat(numPart);
      
      if (!isNaN(num)) {
        let formattedNum: string;
        
        /**
         * Règles professionnelles de formatage (Standard Stripe/Shopify)
         * - Billions: toujours 1 décimale (1.2B)
         * - Millions: toujours 1 décimale (1.5M, 12.3M)
         * - >= 100K: 1 décimale (152.2K, 999.9K)
         * - >= 10K: nombre complet avec séparateurs (45,678)
         * - < 10K: nombre complet avec 2 décimales (1,234.50)
         */
        if (num >= 1_000_000_000) {
          formattedNum = (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        } else if (num >= 1_000_000) {
          formattedNum = (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (num >= 100_000) {
          formattedNum = (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        } else if (num >= 10_000) {
          // Afficher le nombre complet pour une meilleure précision
          formattedNum = new Intl.NumberFormat('fr-FR', {
            maximumFractionDigits: 0,
          }).format(num);
        } else {
          // Petits montants avec 2 décimales
          formattedNum = new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(num);
        }
        
        return { number: formattedNum, currency: currencySymbol };
      }
    }
    
    // Nombres sans devise (même logique)
    const num = typeof val === 'number' ? val : parseFloat(strVal);
    if (!isNaN(num) && typeof val === 'number') {
      if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
      } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
      } else if (num >= 100_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
      } else if (num >= 10_000) {
        return new Intl.NumberFormat('fr-FR', {
          maximumFractionDigits: 0,
        }).format(num);
      } else {
        return new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num);
      }
    }
    
    return strVal;
  };

  const formattedValue = formatValue(value);
  const isObject = typeof formattedValue === 'object' && formattedValue !== null;
  const displayValue = isObject ? formattedValue.number : formattedValue;
  
  // Vérifier la longueur de la valeur ORIGINALE
  const originalValueLength = String(value).replace(/[€$MAD,.\s]/g, '').length;
  const isLongValue = originalValueLength > 12;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground truncate pr-2" title={title}>
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="flex items-baseline gap-1.5" 
          title={`Valeur exacte: ${String(value)}`}
        >
          <span 
            className={`font-bold tabular-nums tracking-tight ${
              isLongValue ? 'text-2xl' : 'text-3xl'
            }`}
          >
            {displayValue}
          </span>
          {isObject && formattedValue.currency && (
            <span className="text-base font-medium text-muted-foreground/70">
              {formattedValue.currency}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}