
'use client';

import { Product } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface GroupSelectionModalProps {
    products: Product[];
    isOpen: boolean;
    onClose: () => void;
    groupName: string;
}

export default function GroupSelectionModal({ products, isOpen, onClose, groupName }: GroupSelectionModalProps) {
    const { addToCart } = useCart();
    const { toast } = useToast();

    const handleAddBothToCart = () => {
        products.forEach(product => {
            addToCart({
                id: product.id,
                name: product.name_en,
                price: product.price,
                quantity: 1,
                image: product.image,
            });
        });
        toast({
            title: "Added to Cart!",
            description: `${groupName} items have been added to your cart.`,
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass-card">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl text-primary">Add {groupName}?</DialogTitle>
                    <DialogDescription>
                        This will add the following items to your cart.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4 space-y-4">
                    {products.map(product => (
                        <div key={product.id} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                <Image src={product.image} alt={product.name_en} fill className="object-cover" />
                            </div>
                            <div>
                                <p className="font-semibold">{product.name_en}</p>
                                <p className="text-primary font-bold">₹{product.price.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button className="neon-button" onClick={handleAddBothToCart}>Add to Cart</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
