-- Apply and commit before the equipment import (new enum values need a commit).
ALTER TYPE public.equipment_brand ADD VALUE IF NOT EXISTS 'nuova-simonelli';
ALTER TYPE public.equipment_brand ADD VALUE IF NOT EXISTS 'eureka';
ALTER TYPE public.equipment_brand ADD VALUE IF NOT EXISTS 'modbar';
ALTER TYPE public.equipment_brand ADD VALUE IF NOT EXISTS 'puqpress';
ALTER TYPE public.equipment_type ADD VALUE IF NOT EXISTS 'tamper';
ALTER TYPE public.equipment_type ADD VALUE IF NOT EXISTS 'steam-module';
