import { Brand } from "@/data/brands";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Mail, MessageSquare, PopupIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BrandCardProps {
  brand: Brand;
}

const BrandCard = ({ brand }: BrandCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Dialog>
      <DialogTrigger>
        <Card 
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardHeader className="space-y-1">
            <div className="w-full h-32 relative">
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="w-full h-full object-contain"
              />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">{brand.name}</h3>
            <div className="flex gap-2 justify-center">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <Mail className="w-5 h-5 text-blue-600" />
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <PopupIcon className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{brand.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <section>
            <h3 className="text-lg font-semibold mb-2">Website</h3>
            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </a>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-2">SMS Examples</h3>
            <div className="grid grid-cols-2 gap-4">
              {brand.smsExamples.map((sms, index) => (
                <img key={index} src={sms} alt="SMS Example" className="w-full rounded-lg shadow" />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Email Examples</h3>
            <div className="grid grid-cols-2 gap-4">
              {brand.emailExamples.map((email, index) => (
                <img key={index} src={email} alt="Email Example" className="w-full rounded-lg shadow" />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Popup Example</h3>
            <img src={brand.popupExample} alt="Popup Example" className="w-full rounded-lg shadow" />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandCard;