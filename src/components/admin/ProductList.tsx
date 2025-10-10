
'use client';

import { useState, useEffect, useTransition } from 'react';
import { getProducts, deleteProduct } from '@/app/actions/adminActions';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductForm from './ProductForm';

export function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, startTransition] = useTransition();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const { toast } = useToast();

    const fetchProducts = () => {
        startTransition(async () => {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsFormOpen(true);
    };
    
    const handleAddNew = () => {
        setProductToEdit(null);
        setIsFormOpen(true);
    }

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        const result = await deleteProduct(productId);
        if (result.success) {
            toast({ title: 'Product Deleted', description: 'The product has been successfully removed.' });
            fetchProducts();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };
    
    const onFormSubmit = () => {
        setIsFormOpen(false);
        fetchProducts(); // Refetch products after add/edit
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Product
                </Button>
            </div>
            
            <div className="rounded-lg border glass-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary"/>
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name_en}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                                    <TableCell>{product.stock_qty}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id)}>
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {isFormOpen && (
                <ProductForm
                    product={productToEdit}
                    onClose={() => setIsFormOpen(false)}
                    onSubmitSuccess={onFormSubmit}
                />
            )}
        </div>
    );
}
