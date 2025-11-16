import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CartItem {
  id: string;
  price: number;
}

interface CustomerInfo {
  email: string;
  name: string;
  phone: string;
  address?: string;
}

interface RequestBody {
  items?: CartItem[];
  customerInfo?: CustomerInfo;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = (await request.json()) as RequestBody;
    
    const { items, customerInfo } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'Sepet boş olamaz' },
        { status: 400 }
      );
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.name || !customerInfo.phone) {
      return NextResponse.json(
        { message: 'Müşteri bilgileri eksik' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: CartItem) => sum + item.price, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    // Try to create guest orders in purchases table
    // Note: If purchases table doesn't have guest fields, you'll need to add them via migration
    // Alternative: Create a separate guest_orders table
    
    let orderData;
    let orderError;

    // First, try with guest fields (if they exist in the table)
    const insertData = items.map((item: CartItem) => ({
      automation_id: item.id,
      user_id: null, // Guest orders have no user_id
      price: item.price,
      status: 'pending', // Will be updated after payment
      purchased_at: new Date().toISOString(),
      // Guest fields (add these columns via migration if they don't exist)
      guest_email: customerInfo.email,
      guest_name: customerInfo.name,
      guest_phone: customerInfo.phone,
      guest_address: customerInfo.address || null,
    }));

    const result = await supabase
      .from('purchases')
      .insert(insertData)
      .select();

    orderData = result.data;
    orderError = result.error;

    if (orderError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Order creation error:', orderError);
      }
      
      // If guest fields don't exist, try without them (basic purchase record)
      // You should add guest fields to purchases table or create guest_orders table
      const basicResult = await supabase
        .from('purchases')
        .insert(
          items.map((item: CartItem) => ({
            automation_id: item.id,
            user_id: null,
            price: item.price,
            status: 'pending',
            purchased_at: new Date().toISOString(),
          }))
        )
        .select();

      if (basicResult.error) {
        return NextResponse.json(
          { 
            message: 'Sipariş oluşturulamadı. Lütfen veritabanı yapılandırmasını kontrol edin.',
            error: basicResult.error.message 
          },
          { status: 500 }
        );
      }

      // Save guest info separately (you might want to create a guest_customers table)
      // For now, we'll just return success with basic order data
      orderData = basicResult.data;
      
      // TODO: Save guest customer info to a separate table (guest_customers or similar)
      // This allows you to link guest orders to customer info later
    }

    // Also save customer info for future reference (optional guest_customers table)
    // This is optional - you can create a separate table for guest customers if needed

    return NextResponse.json({
      success: true,
      orderId: orderData?.[0]?.id,
      orders: orderData,
      total,
      message: 'Sipariş başarıyla oluşturuldu',
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (process.env.NODE_ENV === 'development') {
      console.error('Guest checkout error:', error);
    }
    return NextResponse.json(
      { message: err.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

