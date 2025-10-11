
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addProduct, updateProduct } from '@/app/actions/adminActions';
import { Product, ProductInput } from '@/lib/types';
import { CATEGORIES } from '@/lib/data';
import { Loader2 } from 'lucide-react';

const productSchema = z.object({
    name_en: z.string().min(2, "Product name is required."),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be a positive number."),
    mrp: z.coerce.number().min(0, "MRP must be a positive number."),
    stock_qty: z.coerce.number().int().min(0, "Stock must be a positive integer."),
    category_id: z.string().min(1, "Category is required."),
    brand: z.string().min(2, "Brand is required."),
    image: z.string().url("Must be a valid image URL."),
    imageHint: z.string().optional(),
    is_veg: z.coerce.boolean().default(true),
    pack_size: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    product: Product | null;
    onClose: () => void;
    onSubmitSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSubmitSuccess }: ProductFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!product;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name_en: product?.name_en || '',
            description: product?.description || '',
            price: product?.price || 0,
            mrp: product?.mrp || 0,
            stock_qty: product?.stock_qty || 0,
            category_id: product?.category_id || '',
            brand: product?.brand || '',
            image: product?.image || '',
            imageHint: product?.imageHint || '',
            is_veg: product?.is_veg ?? true,
            pack_size: product?.pack_size || '',
        },
    });

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        setIsLoading(true);

        const productInput: ProductInput = { ...data, category: CATEGORIES.find(c => c.id === data.category_id)?.name_en || 'Unknown' };

        try {
            const result = isEditing
                ? await updateProduct(product!.id, productInput)
                : await addProduct(productInput);

            if (result.success) {
                toast({
                    title: `Product ${isEditing ? 'Updated' : 'Added'}`,
                    description: `The product has been successfully ${isEditing ? 'updated' : 'added'}.`,
                });
                onSubmitSuccess();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Operation Failed',
                description: error.message || 'An unknown error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl glass-card">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>Add a new product or edit an existing one.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
                        <FormField control={form.control} name="name_en" render={({ field }) => (
                            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="mrp" render={({ field }) => (
                                <FormItem><FormLabel>MRP</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="stock_qty" render={({ field }) => (
                                <FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="category_id" render={({ field }) => (
                                <FormItem><FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="brand" render={({ field }) => (
                                <FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="image" render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <DialogFooter className="mt-6">
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                {isEditing ? 'Save Changes' : 'Add Product'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
