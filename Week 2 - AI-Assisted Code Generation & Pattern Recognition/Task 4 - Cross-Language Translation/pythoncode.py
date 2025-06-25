def process_sales_data(sales_records):
    """
    Process sales records and return summary statistics
    """
    if not sales_records or len(sales_records) == 0:
        raise ValueError("No sales records provided")
    
    total_sales = 0
    sales_by_category = {}
    monthly_sales = {}
    
    for record in sales_records:
        if not all(key in record for key in ['amount', 'category', 'date']):
            raise ValueError(f"Invalid record format: {record}")
        
        amount = float(record['amount'])
        category = record['category']
        date = record['date']
        
        total_sales += amount
        
        if category not in sales_by_category:
            sales_by_category[category] = 0
        sales_by_category[category] += amount
        
        month_key = date.strftime('%Y-%m')
        if month_key not in monthly_sales:
            monthly_sales[month_key] = 0
        monthly_sales[month_key] += amount
    
    return {
        'total_sales': total_sales,
        'average_sale': total_sales / len(sales_records),
        'sales_by_category': sales_by_category,
        'monthly_sales': monthly_sales,
        'record_count': len(sales_records)
    }